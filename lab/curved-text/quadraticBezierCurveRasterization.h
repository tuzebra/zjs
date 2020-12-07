#include <stdio.h>
#include <assert.h>
#include <algorithm>
using namespace std;

//==============================
#include "loadbmp.h"
Bitmap bmp;
void DrawPixel(int x, int y) {
	int pixel = y * bmp.width + x;
	auto ptr = bmp.buffer + (bmp.bpp/8) * pixel;
	ptr[0] = ptr[1] = ptr[2] = 255;
}
//==============================


struct Point {
	union {
		struct { double x, y; };
		double a[2];
	};
};

struct Bezier {
	Point pts[3];
};

const double EPS = 1e-7;
const double INF = 1e+50;

double WhenEquals(double p0, double p1, double p2, double val, double minp) {
	//p0 * (1-t)^2 + p1 * 2t(1 - t) + p2 * t^2 = val
	double qa = p0 + p2 - 2 * p1;
	double qb = p1 - p0;
	double qc = p0 - val;
	assert(fabs(qa) > EPS);	//singular case must be handled separately
	double qd = qb * qb - qa * qc;
	if (qd < -EPS)
		return INF;
	qd = sqrt(max(qd, 0.0));
	double t1 = (-qb - qd) / qa;
	double t2 = (-qb + qd) / qa;
	if (t2 < t1) swap(t1, t2);
	if (t1 > minp + EPS)
		return t1;
	else if (t2 > minp + EPS)
		return t2;
	return INF;
}

void DrawCurve(const Bezier &curve) {
	int cell[2];
	for (int c = 0; c < 2; c++)
		cell[c] = int(floor(curve.pts[0].a[c]));
	DrawPixel(cell[0], cell[1]);
	double param = 0.0;
	while (1) {
		int bc = -1, bs = -1;
		double bestTime = 1.0;
		for (int c = 0; c < 2; c++)
			for (int s = 0; s < 2; s++) {
				double crit = WhenEquals(
					curve.pts[0].a[c],
					curve.pts[1].a[c],
					curve.pts[2].a[c],
					cell[c] + s, param
				);
				if (crit < bestTime) {
					bestTime = crit;
					bc = c, bs = s;
				}
			}
		if (bc < 0)
			break;
		param = bestTime;
		cell[bc] += (2*bs - 1);
		DrawPixel(cell[0], cell[1]);
	}
}

int main() {
	bmp = Bitmap(24, 100, 100);
	bmp.alloc();
	memset(bmp.buffer, 0, bmp.size());

	Bezier crv;
	crv.pts[0].x = 10.1;
	crv.pts[0].y = 10.2;
	crv.pts[1].x = 70.1;
	crv.pts[1].y = 110.3;
	crv.pts[2].x = 70.4;
	crv.pts[2].y = 30.1;
	DrawCurve(crv);

	SaveBMP(bmp, "res.bmp", 24);
}