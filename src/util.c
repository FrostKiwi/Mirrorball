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

EMSCRIPTEN_KEEPALIVE void webcam_add(char *id, char *label)
{
	if (!gctx.webcam_count)
		gctx.webcams = malloc(sizeof(struct webcam));
	else
		gctx.webcams = realloc(gctx.webcams,
							   sizeof(struct webcam) * (gctx.webcam_count + 1));

	struct webcam new = {
		.id = malloc(strlen(id) + 1),
		.label = malloc(strlen(label) + 1)};

	strcpy(new.id, id);
	strcpy(new.label, label);

	gctx.webcams[gctx.webcam_count] = new;

	gctx.webcam_count++;
}

EMSCRIPTEN_KEEPALIVE void format_label_list()
{
	if (!gctx.webcam_count)
		return;
	gctx.label_list = malloc(sizeof(char *) * gctx.webcam_count);
	for (int i = 0; i < gctx.webcam_count; ++i)
		gctx.label_list[i] = gctx.webcams[i].label;
	gctx.formatted = true;
}