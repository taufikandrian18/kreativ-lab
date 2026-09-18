<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class KSL_ACF_Fields_Archive_Project {
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
                    'key'        => 'field_ksl_scope',
                    'label'      => 'Scope of Work',
                    'name'       => 'scope',
                    'type'       => 'repeater',
                    'layout'     => 'table',
                    'sub_fields' => [
                        [
                            'key'   => 'field_ksl_scope_item',
                            'label' => 'Item',
                            'name'  => 'item',
                            'type'  => 'text',
                        ],
                    ],
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
                    'key'          => 'field_ksl_gallery',
                    'label'        => 'Gallery',
                    'name'         => 'gallery',
                    'type'         => 'gallery',
                    'return_format' => 'array',
                ],
                [
                    'key'   => 'field_ksl_accent_color',
                    'label' => 'Accent Color',
                    'name'  => 'accent_color',
                    'type'  => 'color_picker',
                ],
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
