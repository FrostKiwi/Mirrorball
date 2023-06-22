#include "gui.h"

void gui()
{
	struct nk_context *ctx = gctx.ctx;

	if (nk_begin(ctx, "Frost-O-Rama",
				 nk_rect(20 * gctx.interface_mult,
						 20 * gctx.interface_mult,
						 400 * gctx.interface_mult,
						 600 * gctx.interface_mult),
				 NK_WINDOW_BORDER | NK_WINDOW_MOVABLE | NK_WINDOW_SCALABLE |
					 NK_WINDOW_MINIMIZABLE | NK_WINDOW_TITLE))
	{
		nk_style_set_font(ctx, gctx.std.handle);
		nk_layout_row_dynamic(ctx, 18 * gctx.interface_mult, 1);
		nk_label(ctx, "Switch between Setup and Projection here",
				 NK_TEXT_ALIGN_LEFT);
		nk_style_set_font(ctx, gctx.std.handle);
		nk_layout_row_dynamic(ctx, 32 * gctx.interface_mult, 2);
		if (nk_option_label(ctx, "Crop image", !gctx.projection))
			gctx.projection = false;
		if (nk_option_label(ctx, "Project image", gctx.projection))
			gctx.projection = true;
		nk_layout_row_dynamic(ctx, 24 * gctx.interface_mult, 1);
		nk_checkbox_label(ctx, "Toggle crop mask", &gctx.mask_toggle);
		nk_checkbox_label(ctx, "Toggle distortion visualization",
						  &gctx.vizualize);
		nk_layout_row_dynamic(ctx, 18 * gctx.interface_mult, 1);
		nk_label(ctx, "Arrow keys on computer or Touch-Drag on",
				 NK_TEXT_ALIGN_LEFT);
		nk_label(ctx, "Smartphones to move the projection camera.",
				 NK_TEXT_ALIGN_LEFT);
		nk_label(ctx, "Shift + Arrows or pinch to zoom",
				 NK_TEXT_ALIGN_LEFT);
		nk_label(ctx, "Click-Drag or Touch-Drag over settings",
				 NK_TEXT_ALIGN_LEFT);
		nk_style_set_font(ctx, gctx.big.handle);
		nk_layout_row_dynamic(ctx, 32 * gctx.interface_mult, 1);
		nk_label(ctx, "Input", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4 * gctx.interface_mult, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);
		nk_style_set_font(ctx, gctx.std.handle);
		if (nk_tree_push(ctx, NK_TREE_TAB, "Sample images", NK_MAXIMIZED))
		{
			ctx->style.button.text_normal = nk_rgb(175, 175, 175);
			ctx->style.button.text_hover = nk_rgb(175, 175, 175);
			ctx->style.button.text_active = nk_rgb(175, 175, 175);
			nk_layout_row_dynamic(ctx, 32 * gctx.interface_mult, 1);
			if (nk_button_label(ctx, "Room"))
			{
				gctx.ch1.rotation = vec3_zero();
				gctx.cam.cam_rotation = vec3_zero();
				EM_ASM(load_from_url("img/room.jpg"););
				gctx.cam.fov = glm_rad(100);
				gctx.cam.cam_rotation.y = 1.5;
				gctx.ch1.crop.top = 46;
				gctx.ch1.crop.bot = 62;
				gctx.ch1.crop.left = 45;
				gctx.ch1.crop.right = 63;
				gctx.ch1.fov_deg = 342;
			}
			if (nk_button_label(ctx, "Department Store"))
			{
				gctx.ch1.rotation = vec3_zero();
				gctx.cam.cam_rotation = vec3_zero();
				EM_ASM(load_from_url("img/store.jpg"););
				gctx.cam.fov = glm_rad(100);
				gctx.cam.cam_rotation.x = -0.5;
				gctx.cam.cam_rotation.y = 1.5;
				gctx.ch1.crop.top = 97;
				gctx.ch1.crop.bot = 125;
				gctx.ch1.crop.left = 102;
				gctx.ch1.crop.right = 113;
				gctx.ch1.rotation.x = glm_rad(-88.3);
				gctx.ch1.fov_deg = 310.29;
			}
			if (nk_button_label(ctx, "Human Mouth"))
			{
				gctx.ch1.rotation = vec3_zero();
				gctx.cam.cam_rotation = vec3_zero();
				EM_ASM(load_from_url("img/mouth.jpg"););
				gctx.cam.fov = glm_rad(100);
				gctx.cam.cam_rotation.y = 3;
				gctx.ch1.crop.top = 567;
				gctx.ch1.crop.bot = 538;
				gctx.ch1.crop.left = 555;
				gctx.ch1.crop.right = 596;
				gctx.ch1.fov_deg = 304;
				gctx.ch1.rotation.x = glm_rad(25);
				gctx.ch1.rotation.z = glm_rad(1);
				gctx.cam.fov = glm_rad(125);
			}
			if (nk_button_label(ctx, "HUGE Tokyo Ball"))
			{
				gctx.ch1.rotation = vec3_zero();
				gctx.cam.cam_rotation = vec3_zero();
				EM_ASM(load_from_url("img/tokyo.jpg"););
				gctx.cam.fov = glm_rad(100);
				gctx.cam.cam_rotation.y = 2;
				gctx.ch1.crop.top = 32;
				gctx.ch1.crop.bot = 39;
				gctx.ch1.crop.left = 63;
				gctx.ch1.crop.right = 17;
				gctx.ch1.fov_deg = 306;
			}
			nk_tree_pop(ctx);
		}
		if (nk_tree_push(ctx, NK_TREE_TAB, "Load Image from device",
						 NK_MAXIMIZED))
		{
			nk_style_set_font(ctx, gctx.std.handle);
			nk_layout_row_dynamic(ctx, 18 * gctx.interface_mult, 1);
			nk_label(ctx, "Load Mirror ball as a photo.", NK_TEXT_ALIGN_LEFT);
			nk_label(ctx, "Or connect a live webcam feed.",
					 NK_TEXT_ALIGN_LEFT);
			nk_style_set_font(ctx, gctx.icons.handle);
			nk_layout_row_dynamic(ctx, 64 * gctx.interface_mult, 2);
			ctx->style.button.text_normal = nk_rgb(8, 166, 142);
			ctx->style.button.text_hover = nk_rgb(8, 166, 142);
			ctx->style.button.text_active = nk_rgb(8, 166, 142);
			if (nk_button_label(ctx, ""))
			{
				/* NON BLOCKING! */
				EM_ASM(open_file(););
			}
			if (nk_button_label(ctx, ""))
			{
				/* NON BLOCKING! */
				EM_ASM(open_webcam(););
			}
			if (nk_button_label(ctx, ""))
			{
				/* NON BLOCKING! */
				EM_ASM(open_video("video00_intro.mp4"););
			}

			nk_tree_pop(ctx);
		}
		/* Cropping */
		nk_style_set_font(ctx, gctx.big.handle);
		nk_layout_row_dynamic(ctx, 32 * gctx.interface_mult, 1);
		nk_label(ctx, "Cropping", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4 * gctx.interface_mult, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);

		nk_style_set_font(ctx, gctx.std.handle);
		nk_layout_row_dynamic(ctx, 30 * gctx.interface_mult, 1);
		nk_label(ctx, "Crop the image to the mirror ball's edge",
				 NK_TEXT_ALIGN_LEFT);
		nk_property_int(ctx, "Top [px]", 0,
						&gctx.ch1.crop.top, gctx.ch1.img.h / 2, 1, 4);
		nk_property_int(ctx, "Bottom [px]", 0,
						&gctx.ch1.crop.bot, gctx.ch1.img.h / 2, 1, 4);
		nk_property_int(ctx, "Left [px]", 0,
						&gctx.ch1.crop.left, gctx.ch1.img.w / 2, 1, 4);
		nk_property_int(ctx, "Right [px]", 0,
						&gctx.ch1.crop.right, gctx.ch1.img.w / 2, 1, 4);

		/* Distortion Correction */
		nk_style_set_font(ctx, gctx.big.handle);
		nk_layout_row_dynamic(ctx, 32 * gctx.interface_mult, 1);
		nk_label(ctx, "Distortion Correction", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4 * gctx.interface_mult, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);

		nk_style_set_font(ctx, gctx.std.handle);
		nk_layout_row_dynamic(ctx, 30 * gctx.interface_mult, 1);
		nk_label(ctx, "For correcting distortion at the pole-point",
				 NK_TEXT_ALIGN_LEFT);

		nk_property_float(ctx, "Sphere's field of view [in °]", 180,
						  &gctx.ch1.fov_deg, 360, 1, 1);
		gctx.ch1.fov = 1.0 / sin(glm_rad(gctx.ch1.fov_deg) / 4.0);

		/* World rotation */
		nk_style_set_font(ctx, gctx.big.handle);
		nk_layout_row_dynamic(ctx, 32 * gctx.interface_mult, 1);
		nk_label(ctx, "World Rotation", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4 * gctx.interface_mult, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);

		nk_style_set_font(ctx, gctx.std.handle);
		nk_layout_row_dynamic(ctx, 20 * gctx.interface_mult, 1);
		nk_label(ctx, "If the mirror ball was captured not at horizon level,",
				 NK_TEXT_ALIGN_LEFT);
		nk_label(ctx, "correct it here, or camera control will be strange.",
				 NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 30 * gctx.interface_mult, 1);
		gctx.ch1.rotation.x =
			glm_rad(nk_propertyf(ctx, "Pitch [offset in °]", -180,
								 glm_deg(gctx.ch1.rotation.x), 180, 1, 1));
		gctx.ch1.rotation.y =
			glm_rad(nk_propertyf(ctx, "Yaw [offset in °]", -180,
								 glm_deg(gctx.ch1.rotation.y), 180, 1, 1));
		gctx.ch1.rotation.z =
			glm_rad(nk_propertyf(ctx, "Roll [offset in °]", -180,
								 glm_deg(gctx.ch1.rotation.z), 180, 1, 1));

		/* Reset to standard Font */
		nk_style_set_font(ctx, gctx.std.handle);
	}
	nk_end(ctx);
}