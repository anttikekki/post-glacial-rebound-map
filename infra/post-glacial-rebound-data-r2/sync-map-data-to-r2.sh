rclone sync \
    ../../map-data-processing/06_generate-map-distribution/result_cog \
    r2:post-glacial-rebound-data/V1 \
    --include "*.tif" \
    --progress 