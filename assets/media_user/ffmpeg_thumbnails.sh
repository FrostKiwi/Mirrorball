for file in *; do
    if [ -f "$file" ]; then
        # Construct the filename for the thumbnail
        thumb="thumb/${file%.*}.jpg"

        # Use ffmpeg to create the thumbnail
        ffmpeg -n -i "$file" -vframes 1 -vf "scale=256:-2" -q:v 7 "$thumb"
    fi
done