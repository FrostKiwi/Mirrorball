$files = Get-ChildItem -File

foreach ($file in $files) {
    # Construct the filename for the thumbnail
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $thumb = "thumb/$baseName.jpg"

    # Use ffmpeg to create the thumbnail
    & ffmpeg -n -i $file.FullName -vframes 1 -vf "scale=256:-2" -q:v 7 $thumb
}