# --- Parse input argument ---
if [ $# -ne 1 ]; then
    echo "Usage: $0 SOURCE_VERSION"
    echo "Calculation source data SOURCE_VERSION must be one of: V1, V2"
    exit 1
fi

SOURCE_VERSION="$1"

case "$SOURCE_VERSION" in
  V1|V2)
    # Valid values, continue
    ;;
  *)
    echo "Error: Invalid SOURCE_VERSION value: '$SOURCE_VERSION'" >&2
    echo "Valid options are: V1 or V2" >&2
    exit 1
    ;;
esac

rclone sync \
    ../../map-data-processing/06_generate-map-distribution/result_cog/$SOURCE_VERSION \
    r2:post-glacial-rebound-data/$SOURCE_VERSION \
    --include "*.tif" \
    --progress 

if [ "$SOURCE_VERSION" = "V2" ]; then
  rclone sync \
    ../../map-data-processing/02_post-glacial-rebound-calculation-V2/03_ice_mask_calculation/result_cog \
    r2:post-glacial-rebound-data/V2/ice \
    --include "*.tif" \
    --progress 
fi