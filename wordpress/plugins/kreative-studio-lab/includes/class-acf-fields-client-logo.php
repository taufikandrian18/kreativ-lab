<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class KSL_ACF_Fields_Client_Logo {
    public static function register(): void {
        acf_add_local_field_group( [
            'key'    => 'group_ksl_client_logo',
            'title'  => 'Client Logo Details',
            'fields' => [
                [
                    'key'   => 'field_ksl_logo_name',
                    'label' => 'Name',
                    'name'  => 'name',
                    'type'  => 'text',
                ],
                [
                    'key'           => 'field_ksl_logo_file',
                    'label'         => 'Logo',
                    'name'          => 'logo',
                    'type'          => 'image',
                    'return_format' => 'array',
                    'mime_types'    => 'svg,png',
                ],
                [
                    'key'   => 'field_ksl_logo_order',
                    'label' => 'Order',
                    'name'  => 'order',
                    'type'  => 'number',
                ],
            ],
            'location' => [
                [
                    [
                        'param'    => 'post_type',
                        'operator' => '==',
                        'value'    => KSL_CPT_Client_Logo::SLUG,
                    ],
                ],
            ],
        ] );
    }
}
