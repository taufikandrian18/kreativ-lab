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
            'gallery'      => self::gallery_slots( $post['id'] ),
            'accent_color' => get_field( 'accent_color', $post['id'] ),
            'featured'     => get_field( 'featured', $post['id'] ),
            'reel_wide'    => get_field( 'reel_wide', $post['id'] ),
            'reel_narrow'  => get_field( 'reel_narrow', $post['id'] ),
            'reel_poster'  => get_field( 'reel_poster', $post['id'] ),
        ];

        return self::shape_archive_project( $raw, get_the_title( $post['id'] ) );
    }

    /** The filled gallery slots, in slot order. See KSL_ACF_Fields_Archive_Project. */
    private static function gallery_slots( int $post_id ): array {
        $images = [];
        for ( $i = 1; $i <= KSL_ACF_Fields_Archive_Project::GALLERY_SLOTS; $i++ ) {
            $image = get_field( "gallery_{$i}", $post_id );
            if ( is_array( $image ) ) {
                $images[] = $image;
            }
        }
        return $images;
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
            'hero_image'   => self::shape_image( $raw['hero_image'] ),
            'gallery'      => array_map( [ __CLASS__, 'shape_image' ], $raw['gallery'] ),
            'accent_color' => $raw['accent_color'],
            // Added after the first contract: absent from a caller's raw array means off.
            'featured'     => (bool) ( $raw['featured'] ?? false ),
            'reel'         => [
                'wide'   => self::shape_file( $raw['reel_wide'] ?? null ),
                'narrow' => self::shape_file( $raw['reel_narrow'] ?? null ),
                'poster' => self::shape_image( $raw['reel_poster'] ?? null ),
            ],
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
            'logo'  => self::shape_image( $raw['logo'] ),
            // Cast explicitly: confirmed live that ACF's 'number' field type can round-trip
            // through get_field() as a numeric string ("24") rather than an int, even though
            // the field is typed 'number'. The contract's job is a stable shape regardless of
            // ACF's own quirks, not passing through whatever it happens to return.
            'order' => (int) $raw['order'],
        ];
    }

    /**
     * One shape for every image in the contract. Width and height travel with the URL
     * because the front-end is a static export: it lays out each image before it loads,
     * and a gallery column span is chosen from the image's proportions. ACF's array
     * return format carries both. Anything that is not an ACF image array (false when the
     * field is empty, null from seed data) becomes all-null rather than a missing key.
     */
    public static function shape_image( $img ): array {
        $img = is_array( $img ) ? $img : [];
        return [
            'url'    => $img['url'] ?? null,
            'alt'    => $img['alt'] ?? null,
            'width'  => isset( $img['width'] ) ? (int) $img['width'] : null,
            'height' => isset( $img['height'] ) ? (int) $img['height'] : null,
        ];
    }

    /** A video or other upload: where it is and what it is, nothing else. */
    public static function shape_file( $file ): array {
        $file = is_array( $file ) ? $file : [];
        return [
            'url'  => $file['url'] ?? null,
            'mime' => $file['mime_type'] ?? null,
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
            'og_image'        => self::shape_image( $raw['og_image'] ),
        ];
    }
}
