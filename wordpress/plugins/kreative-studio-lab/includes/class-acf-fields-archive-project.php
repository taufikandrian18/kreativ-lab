<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class KSL_ACF_Fields_Archive_Project {
    /**
     * Gallery slots. ACF's own gallery field is ACF Pro only; on the free plugin it never
     * renders and stores bare attachment IDs, so editors could not add photographs at
     * all. Numbered image fields work on free ACF, keep their order, and each has its own
     * upload button. Empty slots are skipped, so the gallery closes up around them.
     */
    const GALLERY_SLOTS = 16;

    public static function gallery_fields(): array {
        $fields = [];
        for ( $i = 1; $i <= self::GALLERY_SLOTS; $i++ ) {
            $fields[] = [
                'key'           => "field_ksl_gallery_{$i}",
                'label'         => "Gallery image {$i}",
                'name'          => "gallery_{$i}",
                'type'          => 'image',
                'return_format' => 'array',
                'preview_size'  => 'thumbnail',
                'wrapper'       => [ 'width' => '25' ],
                'instructions'  => $i === 1 ? 'Shown in this order below the opener. Leave all empty to keep the photographs cut from the deck.' : '',
            ];
        }
        return $fields;
    }

    public static function register(): void {
        acf_add_local_field_group( [
            'key'      => 'group_ksl_archive_project',
            'title'    => 'Archive Project Details',
            'fields'   => [
                [
                    'key'   => 'field_ksl_archive_no',
                    'label' => 'Archive Number',
                    'name'  => 'archive_no',
                    'type'  => 'text',
                ],
                [
                    'key'   => 'field_ksl_client',
                    'label' => 'Client',
                    'name'  => 'client',
                    'type'  => 'text',
                ],
                [
                    'key'   => 'field_ksl_industry',
                    'label' => 'Industry',
                    'name'  => 'industry',
                    'type'  => 'text',
                ],
                [
                    'key'   => 'field_ksl_year_range',
                    'label' => 'Year Range',
                    'name'  => 'year_range',
                    'type'  => 'text',
                ],
                [
                    'key'          => 'field_ksl_scope',
                    'label'        => 'Scope of Work',
                    'name'         => 'scope',
                    // Was 'repeater' (ACF Pro only, no license — see spec §3 amendment).
                    // One scope item per line; KSL_REST_Contract::shape_archive_project()
                    // splits this into the same array-of-strings shape the frontend always
                    // received, so the public contract is unaffected by this storage change.
                    'type'         => 'textarea',
                    'instructions' => 'One scope-of-work item per line.',
                    'new_lines'    => '',
                ],
                [
                    'key'     => 'field_ksl_lab',
                    'label'   => 'Lab',
                    'name'    => 'lab',
                    'type'    => 'select',
                    'choices' => [
                        'product'  => 'Product',
                        'creative' => 'Creative',
                        'both'     => 'Both',
                    ],
                ],
                [
                    'key'          => 'field_ksl_hero_image',
                    'label'        => 'Hero Image',
                    'name'         => 'hero_image',
                    'type'         => 'image',
                    'return_format' => 'array',
                ],
                [
                    'key'   => 'field_ksl_accent_color',
                    'label' => 'Accent Color',
                    'name'  => 'accent_color',
                    'type'  => 'color_picker',
                ],
                [
                    'key'          => 'field_ksl_featured',
                    'label'        => 'Show on homepage',
                    'name'         => 'featured',
                    'type'         => 'true_false',
                    'ui'           => 1,
                    'instructions' => 'Up to three case studies appear on the homepage. If fewer than three are ticked, the newest fill the rest.',
                ],
                [
                    'key'           => 'field_ksl_reel_wide',
                    'label'         => 'Reel video, desktop',
                    'name'          => 'reel_wide',
                    'type'          => 'file',
                    'return_format' => 'array',
                    'mime_types'    => 'mp4',
                    'instructions'  => 'Optional short loop shown beside the opener. MP4, about 720–900px wide.',
                ],
                [
                    'key'           => 'field_ksl_reel_narrow',
                    'label'         => 'Reel video, mobile',
                    'name'          => 'reel_narrow',
                    'type'          => 'file',
                    'return_format' => 'array',
                    'mime_types'    => 'mp4',
                    'instructions'  => 'MP4, about 480–560px wide. Leave empty to use the desktop video on phones too.',
                ],
                [
                    'key'           => 'field_ksl_reel_poster',
                    'label'         => 'Reel poster',
                    'name'          => 'reel_poster',
                    'type'          => 'image',
                    'return_format' => 'array',
                    'instructions'  => 'First frame of the reel, same shape as the video. Required when a reel is set.',
                ],
                [
                    'key'       => 'field_ksl_tab_gallery',
                    'label'     => 'Gallery',
                    'name'      => '',
                    'type'      => 'tab',
                    'placement' => 'top',
                ],
                ...self::gallery_fields(),
            ],
            'location' => [
                [
                    [
                        'param'    => 'post_type',
                        'operator' => '==',
                        'value'    => KSL_CPT_Archive_Project::SLUG,
                    ],
                ],
            ],
        ] );
    }
}
