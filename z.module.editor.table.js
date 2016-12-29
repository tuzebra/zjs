// include plugin table for editor
;zjs.require('editor', function(){
	
	// include plugin code

	(function(tinymce) {
		var each = tinymce.each;

		// Checks if the selection/caret is at the start of the specified block element
		function isAtStart(rng, par) {
			var doc = par.ownerDocument, rng2 = doc.createRange(), elm;

			rng2.setStartBefore(par);
			rng2.setEnd(rng.endContainer, rng.endOffset);

			elm = doc.createElement('body');
			elm.appendChild(rng2.cloneContents());

			// Check for text characters of other elements that should be treated as content
			return elm.innerHTML.replace(/<(br|img|object|embed|input|textarea)[^>]*>/gi, '-').replace(/<[^>]+>/g, '').length == 0;
		};

		function getSpanVal(td, name) {
			return parseInt(td.getAttribute(name) || 1);
		}

		/**
		 * Table Grid class.
		 */
		function TableGrid(table, dom, selection) {
			var grid, startPos, endPos, selectedCell;

			buildGrid();
			selectedCell = dom.getParent(selection.getStart(), 'th,td');
			if (selectedCell) {
				startPos = getPos(selectedCell);
				endPos = findEndPos();
				selectedCell = getCell(startPos.x, startPos.y);
			}

			function cloneNode(node, children) {
				node = node.cloneNode(children);
				node.removeAttribute('id');

				return node;
			}

			function buildGrid() {
				var startY = 0;

				grid = [];

				each(['thead', 'tbody', 'tfoot'], function(part) {
					var rows = dom.select('> ' + part + ' tr', table);

					each(rows, function(tr, y) {
						y += startY;

						each(dom.select('> td, > th', tr), function(td, x) {
							var x2, y2, rowspan, colspan;

							// Skip over existing cells produced by rowspan
							if (grid[y]) {
								while (grid[y][x])
									x++;
							}

							// Get col/rowspan from cell
							rowspan = getSpanVal(td, 'rowspan');
							colspan = getSpanVal(td, 'colspan');

							// Fill out rowspan/colspan right and down
							for (y2 = y; y2 < y + rowspan; y2++) {
								if (!grid[y2])
									grid[y2] = [];

								for (x2 = x; x2 < x + colspan; x2++) {
									grid[y2][x2] = {
										part : part,
										real : y2 == y && x2 == x,
										elm : td,
										rowspan : rowspan,
										colspan : colspan
									};
								}
							}
						});
					});

					startY += rows.length;
				});
			};

			function getCell(x, y) {
				var row;

				row = grid[y];
				if (row)
					return row[x];
			};

			function setSpanVal(td, name, val) {
				if (td) {
					val = parseInt(val);

					if (val === 1)
						td.removeAttribute(name, 1);
					else
						td.setAttribute(name, val, 1);
				}
			}

			function isCellSelected(cell) {
				return cell && (dom.hasClass(cell.elm, 'mceSelected') || cell == selectedCell);
			};

			function getSelectedRows() {
				var rows = [];

				each(table.rows, function(row) {
					each(row.cells, function(cell) {
						if (dom.hasClass(cell, 'mceSelected') || cell == selectedCell.elm) {
							rows.push(row);
							return false;
						}
					});
				});

				return rows;
			};

			function deleteTable() {
				var rng = dom.createRng();

				rng.setStartAfter(table);
				rng.setEndAfter(table);

				selection.setRng(rng);

				dom.remove(table);
			};

			function cloneCell(cell) {
				var formatNode;

				// Clone formats
				tinymce.walk(cell, function(node) {
					var curNode;

					if (node.nodeType == 3) {
						each(dom.getParents(node.parentNode, null, cell).reverse(), function(node) {
							node = cloneNode(node, false);

							if (!formatNode)
								formatNode = curNode = node;
							else if (curNode)
								curNode.appendChild(node);

							curNode = node;
						});

						// Add something to the inner node
						if (curNode)
							curNode.innerHTML = tinymce.isIE ? '&nbsp;' : '<br data-mce-bogus="1" />';

						return false;
					}
				}, 'childNodes');

				cell = cloneNode(cell, false);
				setSpanVal(cell, 'rowSpan', 1);
				setSpanVal(cell, 'colSpan', 1);

				if (formatNode) {
					cell.appendChild(formatNode);
				} else {
					if (!tinymce.isIE)
						cell.innerHTML = '<br data-mce-bogus="1" />';
				}

				return cell;
			};

			function cleanup() {
				var rng = dom.createRng();

				// Empty rows
				each(dom.select('tr', table), function(tr) {
					if (tr.cells.length == 0)
						dom.remove(tr);
				});

				// Empty table
				if (dom.select('tr', table).length == 0) {
					rng.setStartAfter(table);
					rng.setEndAfter(table);
					selection.setRng(rng);
					dom.remove(table);
					return;
				}

				// Empty header/body/footer
				each(dom.select('thead,tbody,tfoot', table), function(part) {
					if (part.rows.length == 0)
						dom.remove(part);
				});

				// Restore selection to start position if it still exists
				buildGrid();

				// Restore the selection to the closest table position
				row = grid[Math.min(grid.length - 1, startPos.y)];
				if (row) {
					selection.select(row[Math.min(row.length - 1, startPos.x)].elm, true);
					selection.collapse(true);
				}
			};

			function fillLeftDown(x, y, rows, cols) {
				var tr, x2, r, c, cell;

				tr = grid[y][x].elm.parentNode;
				for (r = 1; r <= rows; r++) {
					tr = dom.getNext(tr, 'tr');

					if (tr) {
						// Loop left to find real cell
						for (x2 = x; x2 >= 0; x2--) {
							cell = grid[y + r][x2].elm;

							if (cell.parentNode == tr) {
								// Append clones after
								for (c = 1; c <= cols; c++)
									dom.insertAfter(cloneCell(cell), cell);

								break;
							}
						}

						if (x2 == -1) {
							// Insert nodes before first cell
							for (c = 1; c <= cols; c++)
								tr.insertBefore(cloneCell(tr.cells[0]), tr.cells[0]);
						}
					}
				}
			};

			function split() {
				each(grid, function(row, y) {
					each(row, function(cell, x) {
						var colSpan, rowSpan, newCell, i;

						if (isCellSelected(cell)) {
							cell = cell.elm;
							colSpan = getSpanVal(cell, 'colspan');
							rowSpan = getSpanVal(cell, 'rowspan');

							if (colSpan > 1 || rowSpan > 1) {
								setSpanVal(cell, 'rowSpan', 1);
								setSpanVal(cell, 'colSpan', 1);

								// Insert cells right
								for (i = 0; i < colSpan - 1; i++)
									dom.insertAfter(cloneCell(cell), cell);

								fillLeftDown(x, y, rowSpan - 1, colSpan);
							}
						}
					});
				});
			};

			function merge(cell, cols, rows) {
				var startX, startY, endX, endY, x, y, startCell, endCell, cell, children, count;

				// Use specified cell and cols/rows
				if (cell) {
					pos = getPos(cell);
					startX = pos.x;
					startY = pos.y;
					endX = startX + (cols - 1);
					endY = startY + (rows - 1);
				} else {
					startPos = endPos = null;

					// Calculate start/end pos by checking for selected cells in grid works better with context menu
					each(grid, function(row, y) {
						each(row, function(cell, x) {
							if (isCellSelected(cell)) {
								if (!startPos) {
									startPos = {x: x, y: y};
								}

								endPos = {x: x, y: y};
							}
						});
					});

					// Use selection
					startX = startPos.x;
					startY = startPos.y;
					endX = endPos.x;
					endY = endPos.y;
				}

				// Find start/end cells
				startCell = getCell(startX, startY);
				endCell = getCell(endX, endY);

				// Check if the cells exists and if they are of the same part for example tbody = tbody
				if (startCell && endCell && startCell.part == endCell.part) {
					// Split and rebuild grid
					split();
					buildGrid();

					// Set row/col span to start cell
					startCell = getCell(startX, startY).elm;
					setSpanVal(startCell, 'colSpan', (endX - startX) + 1);
					setSpanVal(startCell, 'rowSpan', (endY - startY) + 1);

					// Remove other cells and add it's contents to the start cell
					for (y = startY; y <= endY; y++) {
						for (x = startX; x <= endX; x++) {
							if (!grid[y] || !grid[y][x])
								continue;

							cell = grid[y][x].elm;

							if (cell != startCell) {
								// Move children to startCell
								children = tinymce.grep(cell.childNodes);
								each(children, function(node) {
									startCell.appendChild(node);
								});

								// Remove bogus nodes if there is children in the target cell
								if (children.length) {
									children = tinymce.grep(startCell.childNodes);
									count = 0;
									each(children, function(node) {
										if (node.nodeName == 'BR' && dom.getAttrib(node, 'data-mce-bogus') && count++ < children.length - 1)
											startCell.removeChild(node);
									});
								}
							
								// Remove cell
								dom.remove(cell);
							}
						}
					}

					// Remove empty rows etc and restore caret location
					cleanup();
				}
			};

			function insertRow(before) {
				var posY, cell, lastCell, x, rowElm, newRow, newCell, otherCell, rowSpan;

				// Find first/last row
				each(grid, function(row, y) {
					each(row, function(cell, x) {
						if (isCellSelected(cell)) {
							cell = cell.elm;
							rowElm = cell.parentNode;
							newRow = cloneNode(rowElm, false);
							posY = y;

							if (before)
								return false;
						}
					});

					if (before)
						return !posY;
				});

				for (x = 0; x < grid[0].length; x++) {
					// Cell not found could be because of an invalid table structure
					if (!grid[posY][x])
						continue;

					cell = grid[posY][x].elm;

					if (cell != lastCell) {
						if (!before) {
							rowSpan = getSpanVal(cell, 'rowspan');
							if (rowSpan > 1) {
								setSpanVal(cell, 'rowSpan', rowSpan + 1);
								continue;
							}
						} else {
							// Check if cell above can be expanded
							if (posY > 0 && grid[posY - 1][x]) {
								otherCell = grid[posY - 1][x].elm;
								rowSpan = getSpanVal(otherCell, 'rowSpan');
								if (rowSpan > 1) {
									setSpanVal(otherCell, 'rowSpan', rowSpan + 1);
									continue;
								}
							}
						}

						// Insert new cell into new row
						newCell = cloneCell(cell);
						setSpanVal(newCell, 'colSpan', cell.colSpan);

						newRow.appendChild(newCell);

						lastCell = cell;
					}
				}

				if (newRow.hasChildNodes()) {
					if (!before)
						dom.insertAfter(newRow, rowElm);
					else
						rowElm.parentNode.insertBefore(newRow, rowElm);
				}
			};

			function insertCol(before) {
				var posX, lastCell;

				// Find first/last column
				each(grid, function(row, y) {
					each(row, function(cell, x) {
						if (isCellSelected(cell)) {
							posX = x;

							if (before)
								return false;
						}
					});

					if (before)
						return !posX;
				});

				each(grid, function(row, y) {
					var cell, rowSpan, colSpan;

					if (!row[posX])
						return;

					cell = row[posX].elm;
					if (cell != lastCell) {
						colSpan = getSpanVal(cell, 'colspan');
						rowSpan = getSpanVal(cell, 'rowspan');

						if (colSpan == 1) {
							if (!before) {
								dom.insertAfter(cloneCell(cell), cell);
								fillLeftDown(posX, y, rowSpan - 1, colSpan);
							} else {
								cell.parentNode.insertBefore(cloneCell(cell), cell);
								fillLeftDown(posX, y, rowSpan - 1, colSpan);
							}
						} else
							setSpanVal(cell, 'colSpan', cell.colSpan + 1);

						lastCell = cell;
					}
				});
			};

			function deleteCols() {
				var cols = [];

				// Get selected column indexes
				each(grid, function(row, y) {
					each(row, function(cell, x) {
						if (isCellSelected(cell) && tinymce.inArray(cols, x) === -1) {
							each(grid, function(row) {
								var cell = row[x].elm, colSpan;

								colSpan = getSpanVal(cell, 'colSpan');

								if (colSpan > 1)
									setSpanVal(cell, 'colSpan', colSpan - 1);
								else
									dom.remove(cell);
							});

							cols.push(x);
						}
					});
				});

				cleanup();
			};

			function deleteRows() {
				var rows;

				function deleteRow(tr) {
					var nextTr, pos, lastCell;

					nextTr = dom.getNext(tr, 'tr');

					// Move down row spanned cells
					each(tr.cells, function(cell) {
						var rowSpan = getSpanVal(cell, 'rowSpan');

						if (rowSpan > 1) {
							setSpanVal(cell, 'rowSpan', rowSpan - 1);
							pos = getPos(cell);
							fillLeftDown(pos.x, pos.y, 1, 1);
						}
					});

					// Delete cells
					pos = getPos(tr.cells[0]);
					each(grid[pos.y], function(cell) {
						var rowSpan;

						cell = cell.elm;

						if (cell != lastCell) {
							rowSpan = getSpanVal(cell, 'rowSpan');

							if (rowSpan <= 1)
								dom.remove(cell);
							else
								setSpanVal(cell, 'rowSpan', rowSpan - 1);

							lastCell = cell;
						}
					});
				};

				// Get selected rows and move selection out of scope
				rows = getSelectedRows();

				// Delete all selected rows
				each(rows.reverse(), function(tr) {
					deleteRow(tr);
				});

				cleanup();
			};

			function cutRows() {
				var rows = getSelectedRows();

				dom.remove(rows);
				cleanup();

				return rows;
			};

			function copyRows() {
				var rows = getSelectedRows();

				each(rows, function(row, i) {
					rows[i] = cloneNode(row, true);
				});

				return rows;
			};

			function pasteRows(rows, before) {
				// If we don't have any rows in the clipboard, return immediately
				if(!rows)
					return;

				var selectedRows = getSelectedRows(),
					targetRow = selectedRows[before ? 0 : selectedRows.length - 1],
					targetCellCount = targetRow.cells.length;

				// Calc target cell count
				each(grid, function(row) {
					var match;

					targetCellCount = 0;
					each(row, function(cell, x) {
						if (cell.real)
							targetCellCount += cell.colspan;

						if (cell.elm.parentNode == targetRow)
							match = 1;
					});

					if (match)
						return false;
				});

				if (!before)
					rows.reverse();

				each(rows, function(row) {
					var cellCount = row.cells.length, cell;

					// Remove col/rowspans
					for (i = 0; i < cellCount; i++) {
						cell = row.cells[i];
						setSpanVal(cell, 'colSpan', 1);
						setSpanVal(cell, 'rowSpan', 1);
					}

					// Needs more cells
					for (i = cellCount; i < targetCellCount; i++)
						row.appendChild(cloneCell(row.cells[cellCount - 1]));

					// Needs less cells
					for (i = targetCellCount; i < cellCount; i++)
						dom.remove(row.cells[i]);

					// Add before/after
					if (before)
						targetRow.parentNode.insertBefore(row, targetRow);
					else
						dom.insertAfter(row, targetRow);
				});

				// Remove current selection
				dom.removeClass(dom.select('td.mceSelected,th.mceSelected'), 'mceSelected');
			};

			function getPos(target) {
				var pos;

				each(grid, function(row, y) {
					each(row, function(cell, x) {
						if (cell.elm == target) {
							pos = {x : x, y : y};
							return false;
						}
					});

					return !pos;
				});

				return pos;
			};

			function setStartCell(cell) {
				startPos = getPos(cell);
			};

			function findEndPos() {
				var pos, maxX, maxY;

				maxX = maxY = 0;

				each(grid, function(row, y) {
					each(row, function(cell, x) {
						var colSpan, rowSpan;

						if (isCellSelected(cell)) {
							cell = grid[y][x];

							if (x > maxX)
								maxX = x;

							if (y > maxY)
								maxY = y;

							if (cell.real) {
								colSpan = cell.colspan - 1;
								rowSpan = cell.rowspan - 1;

								if (colSpan) {
									if (x + colSpan > maxX)
										maxX = x + colSpan;
								}

								if (rowSpan) {
									if (y + rowSpan > maxY)
										maxY = y + rowSpan;
								}
							}
						}
					});
				});

				return {x : maxX, y : maxY};
			};

			function setEndCell(cell) {
				var startX, startY, endX, endY, maxX, maxY, colSpan, rowSpan;

				endPos = getPos(cell);

				if (startPos && endPos) {
					// Get start/end positions
					startX = Math.min(startPos.x, endPos.x);
					startY = Math.min(startPos.y, endPos.y);
					endX = Math.max(startPos.x, endPos.x);
					endY = Math.max(startPos.y, endPos.y);

					// Expand end positon to include spans
					maxX = endX;
					maxY = endY;

					// Expand startX
					for (y = startY; y <= maxY; y++) {
						cell = grid[y][startX];

						if (!cell.real) {
							if (startX - (cell.colspan - 1) < startX)
								startX -= cell.colspan - 1;
						}
					}

					// Expand startY
					for (x = startX; x <= maxX; x++) {
						cell = grid[startY][x];
						
						if(cell){
							if (!cell.real) {
								if (startY - (cell.rowspan - 1) < startY)
									startY -= cell.rowspan - 1;
							}
						}
					}

					// Find max X, Y
					for (y = startY; y <= endY; y++) {
						for (x = startX; x <= endX; x++) {
							cell = grid[y][x];

							if (cell.real) {
								colSpan = cell.colspan - 1;
								rowSpan = cell.rowspan - 1;

								if (colSpan) {
									if (x + colSpan > maxX)
										maxX = x + colSpan;
								}

								if (rowSpan) {
									if (y + rowSpan > maxY)
										maxY = y + rowSpan;
								}
							}
						}
					}

					// Remove current selection
					dom.removeClass(dom.select('td.mceSelected,th.mceSelected'), 'mceSelected');

					// Add new selection
					for (y = startY; y <= maxY; y++) {
						for (x = startX; x <= maxX; x++) {
							if (grid[y][x])
								dom.addClass(grid[y][x].elm, 'mceSelected');
						}
					}
				}
			};

			// Expose to public
			tinymce.extend(this, {
				deleteTable : deleteTable,
				split : split,
				merge : merge,
				insertRow : insertRow,
				insertCol : insertCol,
				deleteCols : deleteCols,
				deleteRows : deleteRows,
				cutRows : cutRows,
				copyRows : copyRows,
				pasteRows : pasteRows,
				getPos : getPos,
				setStartCell : setStartCell,
				setEndCell : setEndCell
			});
		};

		tinymce.create('tinymce.plugins.TablePlugin', {
			init : function(ed, url) {
				var winMan, clipboardRows, hasCellSelection = true; // Might be selected cells on reload

				function createTableGrid(node) {
					var selection = ed.selection, tblElm = ed.dom.getParent(node || selection.getNode(), 'table');

					if (tblElm)
						return new TableGrid(tblElm, ed.dom, selection);
				};

				function cleanup() {
					// Restore selection possibilities
					ed.getBody().style.webkitUserSelect = '';

					if (hasCellSelection) {
						ed.dom.removeClass(ed.dom.select('td.mceSelected,th.mceSelected'), 'mceSelected');
						hasCellSelection = false;
					}
				};

				// Register buttons
				each([
					['table', 'table.desc', 'mceInsertTable', true],
					['delete_table', 'table.del', 'mceTableDelete'],
					['delete_col', 'table.delete_col_desc', 'mceTableDeleteCol'],
					['delete_row', 'table.delete_row_desc', 'mceTableDeleteRow'],
					['col_after', 'table.col_after_desc', 'mceTableInsertColAfter'],
					['col_before', 'table.col_before_desc', 'mceTableInsertColBefore'],
					['row_after', 'table.row_after_desc', 'mceTableInsertRowAfter'],
					['row_before', 'table.row_before_desc', 'mceTableInsertRowBefore'],
					['row_props', 'table.row_desc', 'mceTableRowProps', true],
					['cell_props', 'table.cell_desc', 'mceTableCellProps', true],
					['split_cells', 'table.split_cells_desc', 'mceTableSplitCells', true],
					['merge_cells', 'table.merge_cells_desc', 'mceTableMergeCells', true]
				], function(c) {
					ed.addButton(c[0], {title : c[1], cmd : c[2], ui : c[3]});
				});

				// Select whole table is a table border is clicked
				if (!tinymce.isIE) {
					ed.onClick.add(function(ed, e) {
						e = e.target;

						if (e.nodeName === 'TABLE') {
							ed.selection.select(e);
							ed.nodeChanged();
						}
					});
				}

				ed.onPreProcess.add(function(ed, args) {
					var nodes, i, node, dom = ed.dom, value;

					nodes = dom.select('table', args.node);
					i = nodes.length;
					while (i--) {
						node = nodes[i];
						dom.setAttrib(node, 'data-mce-style', '');

						if ((value = dom.getAttrib(node, 'width'))) {
							dom.setStyle(node, 'width', value);
							dom.setAttrib(node, 'width', '');
						}

						if ((value = dom.getAttrib(node, 'height'))) {
							dom.setStyle(node, 'height', value);
							dom.setAttrib(node, 'height', '');
						}
					}
				});

				// Handle node change updates
				ed.onNodeChange.add(function(ed, cm, n) {
					var p;

					n = ed.selection.getStart();
					p = ed.dom.getParent(n, 'td,th,caption');
					cm.setActive('table', n.nodeName === 'TABLE' || !!p);

					// Disable table tools if we are in caption
					if (p && p.nodeName === 'CAPTION')
						p = 0;

					cm.setDisabled('delete_table', !p);
					cm.setDisabled('delete_col', !p);
					cm.setDisabled('delete_table', !p);
					cm.setDisabled('delete_row', !p);
					cm.setDisabled('col_after', !p);
					cm.setDisabled('col_before', !p);
					cm.setDisabled('row_after', !p);
					cm.setDisabled('row_before', !p);
					cm.setDisabled('row_props', !p);
					cm.setDisabled('cell_props', !p);
					cm.setDisabled('split_cells', !p);
					cm.setDisabled('merge_cells', !p);
				});

				ed.onInit.add(function(ed) {
					var startTable, startCell, dom = ed.dom, tableGrid;

					winMan = ed.windowManager;

					// Add cell selection logic
					ed.onMouseDown.add(function(ed, e) {
						if (e.button != 2) {
							cleanup();

							startCell = dom.getParent(e.target, 'td,th');
							startTable = dom.getParent(startCell, 'table');
						}
					});

					dom.bind(ed.getDoc(), 'mouseover', function(e) {
						var sel, table, target = e.target;

						if (startCell && (tableGrid || target != startCell) && (target.nodeName == 'TD' || target.nodeName == 'TH')) {
							table = dom.getParent(target, 'table');
							if (table == startTable) {
								if (!tableGrid) {
									tableGrid = createTableGrid(table);
									tableGrid.setStartCell(startCell);

									ed.getBody().style.webkitUserSelect = 'none';
								}

								tableGrid.setEndCell(target);
								hasCellSelection = true;
							}

							// Remove current selection
							sel = ed.selection.getSel();

							try {
								if (sel.removeAllRanges)
									sel.removeAllRanges();
								else
									sel.empty();
							} catch (ex) {
								// IE9 might throw errors here
							}

							e.preventDefault();
						}
					});

					ed.onMouseUp.add(function(ed, e) {
						var rng, sel = ed.selection, selectedCells, nativeSel = sel.getSel(), walker, node, lastNode, endNode;

						// Move selection to startCell
						if (startCell) {
							if (tableGrid)
								ed.getBody().style.webkitUserSelect = '';

							function setPoint(node, start) {
								var walker = new tinymce.dom.TreeWalker(node, node);

								do {
									// Text node
									if (node.nodeType == 3 && tinymce.trim(node.nodeValue).length != 0) {
										if (start)
											rng.setStart(node, 0);
										else
											rng.setEnd(node, node.nodeValue.length);

										return;
									}

									// BR element
									if (node.nodeName == 'BR') {
										if (start)
											rng.setStartBefore(node);
										else
											rng.setEndBefore(node);

										return;
									}
								} while (node = (start ? walker.next() : walker.prev()));
							}

							// Try to expand text selection as much as we can only Gecko supports cell selection
							selectedCells = dom.select('td.mceSelected,th.mceSelected');
							if (selectedCells.length > 0) {
								rng = dom.createRng();
								node = selectedCells[0];
								endNode = selectedCells[selectedCells.length - 1];
								rng.setStartBefore(node);
								rng.setEndAfter(node);

								setPoint(node, 1);
								walker = new tinymce.dom.TreeWalker(node, dom.getParent(selectedCells[0], 'table'));

								do {
									if (node.nodeName == 'TD' || node.nodeName == 'TH') {
										if (!dom.hasClass(node, 'mceSelected'))
											break;

										lastNode = node;
									}
								} while (node = walker.next());

								setPoint(lastNode);

								sel.setRng(rng);
							}

							ed.nodeChanged();
							startCell = tableGrid = startTable = null;
						}
					});

					ed.onKeyUp.add(function(ed, e) {
						cleanup();
					});

					ed.onKeyDown.add(function (ed, e) {
						fixTableCellSelection(ed);
					});

					ed.onMouseDown.add(function (ed, e) {
						if (e.button != 2) {
							fixTableCellSelection(ed);
						}
					});
					function tableCellSelected(ed, rng, n, currentCell) {
						// The decision of when a table cell is selected is somewhat involved.  The fact that this code is
						// required is actually a pointer to the root cause of this bug. A cell is selected when the start 
						// and end offsets are 0, the start container is a text, and the selection node is either a TR (most cases)
						// or the parent of the table (in the case of the selection containing the last cell of a table).
						var TEXT_NODE = 3, table = ed.dom.getParent(rng.startContainer, 'TABLE'), 
						tableParent, allOfCellSelected, tableCellSelection;
						if (table) 
						tableParent = table.parentNode;
						allOfCellSelected =rng.startContainer.nodeType == TEXT_NODE && 
							rng.startOffset == 0 && 
							rng.endOffset == 0 && 
							currentCell && 
							(n.nodeName=="TR" || n==tableParent);
						tableCellSelection = (n.nodeName=="TD"||n.nodeName=="TH")&& !currentCell;	   
						return  allOfCellSelected || tableCellSelection;
						// return false;
					}
				
					// this nasty hack is here to work around some WebKit selection bugs.
					function fixTableCellSelection(ed) {
						if (!tinymce.isWebKit)
							return;

						var rng = ed.selection.getRng();
						var n = ed.selection.getNode();
						var currentCell = ed.dom.getParent(rng.startContainer, 'TD,TH');
				
						if (!tableCellSelected(ed, rng, n, currentCell))
							return;
							if (!currentCell) {
								currentCell=n;
							}
					
						// Get the very last node inside the table cell
						var end = currentCell.lastChild;
						while (end.lastChild)
							end = end.lastChild;
					
						// Select the entire table cell. Nothing outside of the table cell should be selected.
						rng.setEnd(end, end.nodeValue.length);
						ed.selection.setRng(rng);
					}
					ed.plugins.table.fixTableCellSelection=fixTableCellSelection;

					// Fix to allow navigating up and down in a table in WebKit browsers.
					if (tinymce.isWebKit) {
						function moveSelection(ed, e) {
							var VK = tinymce.VK;
							var key = e.keyCode;

							function handle(upBool, sourceNode, event) {
								var siblingDirection = upBool ? 'previousSibling' : 'nextSibling';
								var currentRow = ed.dom.getParent(sourceNode, 'tr');
								var siblingRow = currentRow[siblingDirection];

								if (siblingRow) {
									moveCursorToRow(ed, sourceNode, siblingRow, upBool);
									tinymce.dom.Event.cancel(event);
									return true;
								} else {
									var tableNode = ed.dom.getParent(currentRow, 'table');
									var middleNode = currentRow.parentNode;
									var parentNodeName = middleNode.nodeName.toLowerCase();
									if (parentNodeName === 'tbody' || parentNodeName === (upBool ? 'tfoot' : 'thead')) {
										var targetParent = getTargetParent(upBool, tableNode, middleNode, 'tbody');
										if (targetParent !== null) {
											return moveToRowInTarget(upBool, targetParent, sourceNode, event);
										}
									}
									return escapeTable(upBool, currentRow, siblingDirection, tableNode, event);
								}
							}

							function getTargetParent(upBool, topNode, secondNode, nodeName) {
								var tbodies = ed.dom.select('>' + nodeName, topNode);
								var position = tbodies.indexOf(secondNode);
								if (upBool && position === 0 || !upBool && position === tbodies.length - 1) {
									return getFirstHeadOrFoot(upBool, topNode);
								} else if (position === -1) {
									var topOrBottom = secondNode.tagName.toLowerCase() === 'thead' ? 0 : tbodies.length - 1;
									return tbodies[topOrBottom];
								} else {
									return tbodies[position + (upBool ? -1 : 1)];
								}
							}

							function getFirstHeadOrFoot(upBool, parent) {
								var tagName = upBool ? 'thead' : 'tfoot';
								var headOrFoot = ed.dom.select('>' + tagName, parent);
								return headOrFoot.length !== 0 ? headOrFoot[0] : null;
							}

							function moveToRowInTarget(upBool, targetParent, sourceNode, event) {
								var targetRow = getChildForDirection(targetParent, upBool);
								targetRow && moveCursorToRow(ed, sourceNode, targetRow, upBool);
								tinymce.dom.Event.cancel(event);
								return true;
							}

							function escapeTable(upBool, currentRow, siblingDirection, table, event) {
								var tableSibling = table[siblingDirection];
								if (tableSibling) {
									moveCursorToStartOfElement(tableSibling);
									return true;
								} else {
									var parentCell = ed.dom.getParent(table, 'td,th');
									if (parentCell) {
										return handle(upBool, parentCell, event);
									} else {
										var backUpSibling = getChildForDirection(currentRow, !upBool);
										moveCursorToStartOfElement(backUpSibling);
										return tinymce.dom.Event.cancel(event);
									}
								}
							}

							function getChildForDirection(parent, up) {
								var child =  parent && parent[up ? 'lastChild' : 'firstChild'];
								// BR is not a valid table child to return in this case we return the table cell
								return child && child.nodeName === 'BR' ? ed.dom.getParent(child, 'td,th') : child;
							}

							function moveCursorToStartOfElement(n) {
								ed.selection.setCursorLocation(n, 0);
							}

							function isVerticalMovement() {
								return key == VK.UP || key == VK.DOWN;
							}

							function isInTable(ed) {
								var node = ed.selection.getNode();
								var currentRow = ed.dom.getParent(node, 'tr');
								return currentRow !== null;
							}

							function columnIndex(column) {
								var colIndex = 0;
								var c = column;
								while (c.previousSibling) {
									c = c.previousSibling;
									colIndex = colIndex + getSpanVal(c, "colspan");
								}
								return colIndex;
							}

							function findColumn(rowElement, columnIndex) {
								var c = 0;
								var r = 0;
								each(rowElement.children, function(cell, i) {
									c = c + getSpanVal(cell, "colspan");
									r = i;
									if (c > columnIndex)
										return false;
								});
								return r;
							}

							function moveCursorToRow(ed, node, row, upBool) {
								var srcColumnIndex = columnIndex(ed.dom.getParent(node, 'td,th'));
								var tgtColumnIndex = findColumn(row, srcColumnIndex);
								var tgtNode = row.childNodes[tgtColumnIndex];
								var rowCellTarget = getChildForDirection(tgtNode, upBool);
								moveCursorToStartOfElement(rowCellTarget || tgtNode);
							}

							function shouldFixCaret(preBrowserNode) {
								var newNode = ed.selection.getNode();
								var newParent = ed.dom.getParent(newNode, 'td,th');
								var oldParent = ed.dom.getParent(preBrowserNode, 'td,th');
								return newParent && newParent !== oldParent && checkSameParentTable(newParent, oldParent)
							}

							function checkSameParentTable(nodeOne, NodeTwo) {
								return ed.dom.getParent(nodeOne, 'TABLE') === ed.dom.getParent(NodeTwo, 'TABLE');
							}

							if (isVerticalMovement() && isInTable(ed)) {
								var preBrowserNode = ed.selection.getNode();
								setTimeout(function() {
									if (shouldFixCaret(preBrowserNode)) {
										handle(!e.shiftKey && key === VK.UP, preBrowserNode, e);
									}
								}, 0);
							}
						}

						ed.onKeyDown.add(moveSelection);
					}

					// Fixes an issue on Gecko where it's impossible to place the caret behind a table
					// This fix will force a paragraph element after the table but only when the forced_root_block setting is enabled
					function fixTableCaretPos() {
						var last;

						// Skip empty text nodes form the end
						for (last = ed.getBody().lastChild; last && last.nodeType == 3 && !last.nodeValue.length; last = last.previousSibling) ;

						if (last && last.nodeName == 'TABLE') {
							if (ed.settings.forced_root_block)
								ed.dom.add(ed.getBody(), ed.settings.forced_root_block, null, tinymce.isIE ? '&nbsp;' : '<br data-mce-bogus="1" />');
							else
								ed.dom.add(ed.getBody(), 'br', {'data-mce-bogus': '1'});
						}
					};

					// Fixes an bug where it's impossible to place the caret before a table in Gecko
					// this fix solves it by detecting when the caret is at the beginning of such a table
					// and then manually moves the caret infront of the table
					if (tinymce.isGecko) {
						ed.onKeyDown.add(function(ed, e) {
							var rng, table, dom = ed.dom;

							// On gecko it's not possible to place the caret before a table
							if (e.keyCode == 37 || e.keyCode == 38) {
								rng = ed.selection.getRng();
								table = dom.getParent(rng.startContainer, 'table');

								if (table && ed.getBody().firstChild == table) {
									if (isAtStart(rng, table)) {
										rng = dom.createRng();

										rng.setStartBefore(table);
										rng.setEndBefore(table);

										ed.selection.setRng(rng);

										e.preventDefault();
									}
								}
							}
						});
					}

					ed.onKeyUp.add(fixTableCaretPos);
					ed.onSetContent.add(fixTableCaretPos);
					ed.onVisualAid.add(fixTableCaretPos);

					ed.onPreProcess.add(function(ed, o) {
						var last = o.node.lastChild;

						if (last && (last.nodeName == "BR" || (last.childNodes.length == 1 && (last.firstChild.nodeName == 'BR' || last.firstChild.nodeValue == '\u00a0'))) && last.previousSibling && last.previousSibling.nodeName == "TABLE") {
							ed.dom.remove(last);
						}
					});


					fixTableCaretPos();
					ed.startContent = ed.getContent({format : 'raw'});
				});

				// Register action commands
				each({
					mceTableSplitCells : function(grid) {grid.split();},
					mceTableMergeCells : function(grid) {if(ed.dom.select('td.mceSelected,th.mceSelected').length)grid.merge();},
					mceTableInsertRowAfter : function(grid) {grid.insertRow();},
					mceTableInsertRowBefore : function(grid) {grid.insertRow(true);},
					mceTableInsertColAfter : function(grid) {grid.insertCol();},
					mceTableInsertColBefore : function(grid) {grid.insertCol(true);},
					mceTableDeleteCol : function(grid) {grid.deleteCols();},
					mceTableDeleteRow : function(grid) {grid.deleteRows();},

					mceTableCutRow : function(grid) {clipboardRows = grid.cutRows();},
					mceTableCopyRow : function(grid) {clipboardRows = grid.copyRows();},
					mceTablePasteRowBefore : function(grid) {grid.pasteRows(clipboardRows, true);},
					mceTablePasteRowAfter : function(grid) {grid.pasteRows(clipboardRows);},
					mceTableDelete : function(grid) {grid.deleteTable();}
				}, function(func, name) {
					ed.addCommand(name, function() {
						var grid = createTableGrid();

						if (grid) {
							func(grid);
							ed.execCommand('mceRepaint');
							cleanup();
						}
					});
				});
			}
		});

		// Register plugin
		tinymce.PluginManager.add('table', tinymce.plugins.TablePlugin);
	})(tinymce);

	
	// extend them option cho editor
	zjs.extend(zjs.moduleEditorOption, {
	});

	// extend plugin
	zjs.extend(zjs.moduleEditorPlugins, {
		table: function(option, editorOption){
		}
	});
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance (nhung cai core)
	zjs.extendMethod({
		
		// TABLE
		editorInsertTable: function(option){
			
			// fix option
			option = zjs.extend({column:2,row:2}, option);
			option.column = parseInt(option.column);if(!option.column)option.column = 2;
			option.row = parseInt(option.row);if(!option.row)option.row = 2;
			
			// tao ra html
			var html = '<table>',r=1,c=1;
			for(r=1;r<=option.row;r++){
				html += '<tr>';
				for(c=1;c<=option.column;c++){
					if(r==1)html += '<td>'+c+'</td>';
					else if(c==1)html += '<td>'+r+'</td>';
					else html += '<td></td>';
				};
				html += '</tr>';
			};
			html += '</table>';
			
			// sau khi co html roi thi se insert vao thoi
			return this.editorInsert(html);
		},
		editorDeleteTable: function(){
			return this.editorCommand('mceTableDelete');
		},
		// row
		editorInsertRowAfter: function(){
			return this.editorCommand('mceTableInsertRowAfter');
		},
		editorInsertRowBefore: function(){
			return this.editorCommand('mceTableInsertRowBefore');
		},
		editorInsertRowBelow: function(){
			return this.editorCommand('mceTableInsertRowAfter');
		},
		editorInsertRowAbove: function(){
			return this.editorCommand('mceTableInsertRowBefore');
		},
		editorDeleteRow: function(){
			return this.editorCommand('mceTableDeleteRow');
		},
		// column
		editorInsertColumnAfter: function(){
			return this.editorCommand('mceTableInsertColAfter');
		},
		editorInsertColumnBefore: function(){
			return this.editorCommand('mceTableInsertColBefore');
		},
		editorInsertColumnRight: function(){
			return this.editorCommand('mceTableInsertColAfter');
		},
		editorInsertColumnLeft: function(){
			return this.editorCommand('mceTableInsertColBefore');
		},
		editorDeleteColumn: function(){
			return this.editorCommand('mceTableDeleteCol');
		},
		// cell
		editorSplitCells: function(){
			return this.editorCommand('mceTableSplitCells');
		},
		editorMergeCells: function(){
			return this.editorCommand('mceTableMergeCells');
		}
	});
	
	
	
	// INSERT TABLE POPUP
	// - - - - - - - - - -
	
	var edkey = 'zmoduleeditormceed';
	
	// template
	var _popupinserttablehtml = '<div class="zeditor-inserttable-popup">'+
						'<form>'+
							'<h3>Insert table</h3>'+
							'<div class="field field-column"><label><span>Column</span> <input type="text" name="column" value="" placeholder="2" /></label></div>'+
							'<div class="field field-row"><label><span>Row</span> <input type="text" name="row" value="" placeholder="2" /></label></div>'+
							'<div class="buttons-wrapper">'+
								'<button type="submit" class="zbutton blue btninsert">Insert</button>'+
							'</div>'+
						'</form>'+
					'</div>';
	// --				
	zjs.extendMethod({
		editorInsertTablePopup: function(){
			// cai nay chi xu ly tren thang dau tien thoi 
			var zEl = this.item(0);
			
			// get ra xem coi day co phai la 1 cai zeditor khong
			// neu khong thi thoi
			var ed = zEl.getData(edkey);
			if(!ed)return this;
			
			// tao ra cai popup
			var insertTablePopupEl = zjs(_popupinserttablehtml).appendTo(document.body).makePopup({center:true,autoshow:true,closethenremove:true});
			// make cac ui button neu nhu chua
			if('moduleUiButtonOption' in zjs)insertTablePopupEl.find('.zbutton').makeButton();
			// focus
			insertTablePopupEl.find('[name=column]').focus();
			
			// bind event
			insertTablePopupEl.find('form').on('submit', function(event){
				event.preventDefault();
				zEl.editorInsertTable(this.getFormData());
				insertTablePopupEl.popupHide();
			});
			
			return this;
		}
	});
	
	

	// done
	if('required' in zjs)
	zjs.required('editor.table');
});