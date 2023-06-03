#include "init.h"

void init_fonts(struct global_context *gctx)
{
    /* Fonts */
    struct nk_font *std, *big, *icons;
    struct nk_font_atlas *atlas;
    struct nk_font_config cfg_std = nk_font_config(0);
    struct nk_font_config cfg_big = nk_font_config(0);
    struct nk_font_config cfg_icons = nk_font_config(0);
    const nk_rune ranges_std[] = {
        0x0020, 0x007E, /* Ascii */
        0x00A1, 0x00FF, /* Symbols + Umlaute */
        0};
    const nk_rune ranges_icons[] = {
        0xF00D, 0xF00D, /*  */
        0xF07C, 0xF07C, /*  */
        0xF083, 0xF083, /*  */
        0xF0AD, 0xF0AD, /*  */
        0xF021, 0xF021, /*  */
        0xF1C5, 0xF1C5, /*  */
        0xF063, 0xF063, /*  */
        0xF053, 0xF053, /*  */
        0xF054, 0xF054, /*  */
        0};

    gctx->std.ranges = malloc(sizeof(ranges_std));
    gctx->icons.ranges = malloc(sizeof(ranges_icons));
    memcpy(gctx->std.ranges, ranges_std, sizeof(ranges_std));
    memcpy(gctx->icons.ranges, ranges_icons, sizeof(ranges_icons));

    cfg_std.range = gctx->std.ranges;
    /* Big text size and small size use the same glyph ranges */
    cfg_big.range = gctx->std.ranges;
    cfg_icons.range = gctx->icons.ranges;
    cfg_std.oversample_h = cfg_std.oversample_v = 1;
    cfg_big.oversample_h = cfg_icons.oversample_v = 1;
    cfg_icons.oversample_h = cfg_icons.oversample_v = 1;
    cfg_std.pixel_snap = true;
    cfg_big.pixel_snap = true;
    cfg_icons.pixel_snap = true;

    nk_sdl_font_stash_begin(&atlas);
    std = nk_font_atlas_add_from_file(
        atlas, "res/font/roboto.ttf", 22 * gctx->interface_mult, &cfg_std);
    big = nk_font_atlas_add_from_file(
        atlas, "res/font/roboto.ttf", 32 * gctx->interface_mult, &cfg_big);
    icons = nk_font_atlas_add_from_file(
        atlas, "res/font/icons.ttf", 46 * gctx->interface_mult, &cfg_icons);
    nk_sdl_font_stash_end();

    gctx->std.handle = &std->handle;
    gctx->big.handle = &big->handle;
    gctx->icons.handle = &icons->handle;
    nk_style_set_font(gctx->ctx, gctx->std.handle);
}