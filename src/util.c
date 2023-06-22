#include "util.h"

void reset_image()
{
	gctx.cam.cam_rotation = vec3_zero();
	gctx.ch1.rotation = vec3_zero();
	gctx.ch1.fov_deg = 360;
	gctx.cam.fov = glm_rad(100);
	gctx.ch1.crop.bot = 0;
	gctx.ch1.crop.top = 0;
	gctx.ch1.crop.left = 0;
	gctx.ch1.crop.right = 0;
}

/* Add new frame time and calculate the average of the past 100 */
float update_100_average(Uint32 new)
{
	gctx.debug.time.floating_pnt++;
	if (gctx.debug.time.floating_pnt >= 100)
		gctx.debug.time.floating_pnt = 0;
	gctx.debug.time.floating_average[gctx.debug.time.floating_pnt] = new;
	Uint32 sum = 0;
	for (int i = 0; i < 100; ++i)
	{
		sum += gctx.debug.time.floating_average[i];
	}
	return (float)sum / 100.f;
}