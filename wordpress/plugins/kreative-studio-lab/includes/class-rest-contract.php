<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class KSL_REST_Contract {
    public static function register(): void {
        register_rest_field(
            KSL_CPT_Archive_Project::SLUG,
            'ksl_project',
            [ 'get_callback' => [ __CLASS__, 'get_archive_project_field' ] ]
        );

        register_rest_field(
            KSL_CPT_Client_Logo::SLUG,
            'ksl_logo',
            [ 'get_callback' => [ __CLASS__, 'get_client_logo_field' ] ]
        );
    }

    public static function get_archive_project_field( array $post ): array {
        $raw = [
            'archive_no'   => get_field( 'archive_no', $post['id'] ),
            'client'       => get_field( 'client', $post['id'] ),
            'industry'     => get_field( 'industry', $post['id'] ),
            'year_range'   => get_field( 'year_range', $post['id'] ),
            'scope'        => get_field( 'scope', $post['id'] ) ?: [],
            'lab'          => get_field( 'lab', $post['id'] ),
            'hero_image'   => get_field( 'hero_image', $post['id'] ),
            'gallery'      => get_field( 'gallery', $post['id'] ) ?: [],
            'accent_color' => get_field( 'accent_color', $post['id'] ),
        ];

        return self::shape_archive_project( $raw, get_the_title( $post['id'] ) );
    }

    public static function shape_archive_project( array $raw, string $title ): array {
        return [
            'archive_no'   => $raw['archive_no'],
            'title'        => $title,
            'client'       => $raw['client'],
            'industry'     => $raw['industry'],
            'year_range'   => $raw['year_range'],
            'scope'        => array_map( fn( $row ) => $row['item'], $raw['scope'] ),
            'lab'          => $raw['lab'],
            'hero_image'   => [
                'url' => $raw['hero_image']['url'] ?? null,
                'alt' => $raw['hero_image']['alt'] ?? null,
            ],
            'gallery'      => array_map(
                fn( $img ) => [ 'url' => $img['url'] ?? null, 'alt' => $img['alt'] ?? null ],
                $raw['gallery']
            ),
            'accent_color' => $raw['accent_color'],
        ];
    }

    public static function get_client_logo_field( array $post ): array {
        $raw = [
            'name'  => get_field( 'name', $post['id'] ),
            'logo'  => get_field( 'logo', $post['id'] ),
            'order' => get_field( 'order', $post['id'] ),
        ];

        return self::shape_client_logo( $raw );
    }

    public static function shape_client_logo( array $raw ): array {
        return [
            'name'  => $raw['name'],
            'logo'  => [
                'url' => $raw['logo']['url'] ?? null,
                'alt' => $raw['logo']['alt'] ?? null,
            ],
            'order' => $raw['order'],
        ];
    }
}
