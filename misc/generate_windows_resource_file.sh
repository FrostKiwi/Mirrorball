mkdir -p ../lib
windres windows_icon_res.rc -O coff -o ../lib/icon.res
windres windows_version.rc -O coff -o ../lib/version.res
