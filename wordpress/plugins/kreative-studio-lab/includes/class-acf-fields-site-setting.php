<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class KSL_ACF_Fields_Site_Setting {
    public static function register(): void {
        acf_add_local_field_group( [
            'key'      => 'group_ksl_site_setting',
            'title'    => 'Contact Details',
            'fields'   => [
                [
                    'key'   => 'field_ksl_phone_primary',
                    'label' => 'Primary Phone',
                    'name'  => 'phone_primary',
                    'type'  => 'text',
                ],
                [
                    'key'   => 'field_ksl_phone_secondary',
                    'label' => 'Secondary Phone',
                    'name'  => 'phone_secondary',
                    'type'  => 'text',
                ],
                [
                    'key'   => 'field_ksl_email',
                    'label' => 'Email',
                    'name'  => 'email',
                    'type'  => 'email',
                ],
                [
                    'key'   => 'field_ksl_instagram',
                    'label' => 'Instagram',
                    'name'  => 'instagram',
                    'type'  => 'text',
                ],
                [
                    'key'   => 'field_ksl_address',
                    'label' => 'Address',
                    'name'  => 'address',
                    'type'  => 'textarea',
                ],
                [
                    'key'           => 'field_ksl_og_image',
                    'label'         => 'Default OG Image',
                    'name'          => 'og_image',
                    'type'          => 'image',
                    'return_format' => 'array',
                ],
            ],
            'location' => [
                [
                    [
                        'param'    => 'post_type',
                        'operator' => '==',
                        'value'    => KSL_CPT_Site_Setting::SLUG,
                    ],
                ],
            ],
        ] );
    }
}
