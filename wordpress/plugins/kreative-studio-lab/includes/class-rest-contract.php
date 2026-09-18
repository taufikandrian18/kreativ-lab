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

        register_rest_field(
            KSL_CPT_Site_Setting::SLUG,
            'ksl_site_setting',
            [ 'get_callback' => [ __CLASS__, 'get_site_setting_field' ] ]
        );
    }

    public static function get_archive_project_field( array $post ): array {
        $raw = [
            'archive_no'   => get_field( 'archive_no', $post['id'] ),
            'client'       => get_field( 'client', $post['id'] ),
            'industry'     => get_field( 'industry', $post['id'] ),
            'year_range'   => get_field( 'year_range', $post['id'] ),
            // 'scope' is a textarea (ACF free), not a repeater (ACF Pro) — see spec §3
            // amendment. Default is '', not [], to match the textarea field's real return type.
            'scope'        => get_field( 'scope', $post['id'] ) ?: '',
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
            'scope'        => self::split_scope_lines( $raw['scope'] ),
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
            // Cast explicitly: confirmed live that ACF's 'number' field type can round-trip
            // through get_field() as a numeric string ("24") rather than an int, even though
            // the field is typed 'number'. The contract's job is a stable shape regardless of
            // ACF's own quirks, not passing through whatever it happens to return.
            'order' => (int) $raw['order'],
        ];
    }

    /**
     * Splits a newline-delimited textarea value into a trimmed, non-empty-line array —
     * the same shape the frontend always received when 'scope' was an ACF Pro repeater.
     */
    private static function split_scope_lines( string $scope ): array {
        $lines = preg_split( '/\r\n|\r|\n/', $scope );
        return array_values( array_filter(
            array_map( 'trim', $lines ),
            fn( $line ) => $line !== ''
        ) );
    }

    public static function get_site_setting_field( array $post ): array {
        $raw = [
            'phone_primary'   => get_field( 'phone_primary', $post['id'] ),
            'phone_secondary' => get_field( 'phone_secondary', $post['id'] ),
            'email'           => get_field( 'email', $post['id'] ),
            'instagram'       => get_field( 'instagram', $post['id'] ),
            'address'         => get_field( 'address', $post['id'] ),
            'og_image'        => get_field( 'og_image', $post['id'] ),
        ];

        return self::shape_site_setting( $raw );
    }

    public static function shape_site_setting( array $raw ): array {
        return [
            'phone_primary'   => $raw['phone_primary'],
            'phone_secondary' => $raw['phone_secondary'],
            'email'           => $raw['email'],
            'instagram'       => $raw['instagram'],
            'address'         => $raw['address'],
            'og_image'        => [
                'url' => $raw['og_image']['url'] ?? null,
                'alt' => $raw['og_image']['alt'] ?? null,
            ],
        ];
    }
}
