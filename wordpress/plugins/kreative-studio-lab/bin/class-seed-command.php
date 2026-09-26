<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * `wp ksl seed` — fills WordPress with the site's current content.
 *
 * Safe to run again at any time: anything that already exists is left exactly as an
 * editor left it. Only missing posts are created, and only empty fields are filled. That
 * is what lets a site that was seeded before a new section became editable pick up that
 * section with the same command.
 *
 * `wp ksl seed --refresh-copy` also brings untouched copy up to date: a field whose value
 * is still exactly a previous default (`was` in data/site-pages.json) gets the current
 * default. A field an editor changed is never overwritten. Each refresh is printed.
 *
 * `wp ksl seed --import-media --media-from=<folder or URL>` puts the site's own photos,
 * films and logos into the Media Library and into every empty media field, so an editor
 * sees what is there and can swap it. The files come from the built site: the folder it
 * is deployed to, or its public address. The list is data/default-media.json, generated
 * from the front end (frontend/lib/default-media.ts). Each upload is labelled with the
 * path it came from; a field still holding its own label is served from the original
 * file, so importing changes nothing on the live site. Safe to re-run: a file already
 * imported is reused, and a field that is not empty is never touched.
 */
class KSL_Seed_Command {
    /** @var bool */
    private static $refresh_copy = false;
    /** @var int */
    private static $refreshed = 0;
    /** @var string */
    private static $media_from = '';
    /** @var int */
    private static $imported = 0;

    public static function register(): void {
        WP_CLI::add_command( 'ksl seed', [ __CLASS__, 'seed' ] );
    }

    public static function seed( array $args = [], array $assoc_args = [] ): void {
        self::$refresh_copy = ! empty( $assoc_args['refresh-copy'] );
        $created = 0;
        $created += self::seed_archive_projects();
        $created += self::seed_client_logos();
        $created += self::seed_site_setting();
        $created += self::seed_site_pages();
        if ( ! empty( $assoc_args['import-media'] ) ) {
            self::$media_from = rtrim( (string) ( $assoc_args['media-from'] ?? KSL_Public_Site::url() ), '/' );
            self::import_default_media();
            WP_CLI::log( 'Media: ' . self::$imported . ' empty fields filled from ' . self::$media_from );
        }
        $refreshed = self::$refreshed;
        WP_CLI::success(
            self::$refresh_copy
                ? "Seed complete: {$created} new posts; {$refreshed} untouched fields brought up to the current copy."
                : "Seed complete: {$created} new posts; existing content left as it was."
        );
    }

    private static function existing_by_title( string $post_type, string $title ): int {
        $found = get_posts( [
            'post_type'   => $post_type,
            'title'       => $title,
            'post_status' => 'any',
            'numberposts' => 1,
            'fields'      => 'ids',
        ] );
        return $found ? (int) $found[0] : 0;
    }

    private static function data( string $file ): array {
        return json_decode( file_get_contents( KSL_PLUGIN_DIR . '/data/' . $file ), true );
    }

    private static function seed_archive_projects(): int {
        $created = 0;
        foreach ( self::data( 'archive-projects.json' ) as $entry ) {
            $post_id = self::existing_by_title( KSL_CPT_Archive_Project::SLUG, $entry['title'] );
            if ( ! $post_id ) {
                $post_id = wp_insert_post( [
                    'post_type'   => KSL_CPT_Archive_Project::SLUG,
                    'post_title'  => $entry['title'],
                    'post_status' => 'publish',
                ] );
                update_field( 'archive_no', $entry['archive_no'], $post_id );
                update_field( 'client', $entry['client'], $post_id );
                update_field( 'industry', $entry['industry'], $post_id );
                update_field( 'year_range', $entry['year_range'], $post_id );
                update_field( 'lab', $entry['lab'], $post_id );
                $created++;
            }

            // The homepage has always previewed 01–03. Ticked once, here, only if nobody
            // has ever set the field; an editor's choice is never overwritten.
            if ( ! metadata_exists( 'post', $post_id, 'featured' ) ) {
                update_field( 'featured', in_array( $entry['archive_no'], [ '01', '02', '03' ], true ) ? 1 : 0, $post_id );
            }
        }
        return $created;
    }

    private static function seed_client_logos(): int {
        $created = 0;
        foreach ( self::data( 'client-logos.json' ) as $entry ) {
            if ( self::existing_by_title( KSL_CPT_Client_Logo::SLUG, $entry['name'] ) ) {
                continue;
            }
            $post_id = wp_insert_post( [
                'post_type'   => KSL_CPT_Client_Logo::SLUG,
                'post_title'  => $entry['name'],
                'post_status' => 'publish',
            ] );
            update_field( 'name', $entry['name'], $post_id );
            update_field( 'order', $entry['order'], $post_id );
            $created++;
        }
        return $created;
    }

    /**
     * The one 'site_setting' post (replaces the ACF options page — see spec §3 amendment).
     * Contact values ship empty: this command does not fabricate phone/email data, and
     * /contact shows the numbers transcribed from the deck until they are filled in.
     */
    private static function seed_site_setting(): int {
        $existing = get_posts( [
            'post_type'   => KSL_CPT_Site_Setting::SLUG,
            'post_status' => 'any',
            'numberposts' => 1,
            'fields'      => 'ids',
        ] );
        if ( $existing ) {
            return 0;
        }
        wp_insert_post( [
            'post_type'   => KSL_CPT_Site_Setting::SLUG,
            'post_title'  => 'Site Settings',
            'post_status' => 'publish',
        ] );
        return 1;
    }

    /**
     * One post per page in data/site-pages.json, with every empty text field set to the
     * copy the site shows today — so an editor opens "Home" and finds the real headline,
     * not a blank box. Images and videos stay empty: empty means "the current artwork".
     */
    private static function seed_site_pages(): int {
        $created = 0;
        foreach ( KSL_Site_Pages::schema() as $index => $page ) {
            $found   = get_posts( [
                'post_type'   => KSL_Site_Pages::SLUG,
                'post_status' => 'any',
                'numberposts' => 1,
                'fields'      => 'ids',
                'meta_key'    => KSL_Site_Pages::META_KEY,
                'meta_value'  => $page['key'],
            ] );
            $post_id = $found ? (int) $found[0] : 0;

            if ( ! $post_id ) {
                $post_id = wp_insert_post( [
                    'post_type'   => KSL_Site_Pages::SLUG,
                    'post_title'  => $page['title'],
                    'post_status' => 'publish',
                    'menu_order'  => $index,
                ] );
                update_post_meta( $post_id, KSL_Site_Pages::META_KEY, $page['key'] );
                $created++;
            }

            foreach ( KSL_Site_Pages::fields( $page ) as $field ) {
                if ( ! isset( $field['default'] ) ) {
                    continue;
                }
                $key = KSL_Site_Pages::field_key( $page['key'], $field['name'] );
                $current = get_field( $key, $post_id, false );
                if ( trim( (string) $current ) === '' ) {
                    update_field( $key, $field['default'], $post_id );
                    continue;
                }
                if ( self::$refresh_copy ) {
                    $next = KSL_Site_Pages::refreshed_value( $field, $current );
                    if ( $next !== null ) {
                        update_field( $key, $next, $post_id );
                        self::$refreshed++;
                        WP_CLI::log( "  refreshed {$page['key']}.{$field['name']}" );
                    }
                }
            }
        }
        return $created;
    }

    private static function import_default_media(): void {
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
        $map = self::data( 'default-media.json' );

        foreach ( $map['site_pages'] ?? [] as $page_key => $fields ) {
            $found = get_posts( [
                'post_type'   => KSL_Site_Pages::SLUG,
                'post_status' => 'any',
                'numberposts' => 1,
                'fields'      => 'ids',
                'meta_key'    => KSL_Site_Pages::META_KEY,
                'meta_value'  => $page_key,
            ] );
            if ( ! $found ) {
                continue;
            }
            foreach ( $fields as $name => $path ) {
                self::fill( KSL_Site_Pages::field_key( $page_key, $name ), (int) $found[0], $path, "{$page_key}.{$name}" );
            }
        }

        foreach ( $map['archive_projects'] ?? [] as $no => $media ) {
            $found = get_posts( [
                'post_type'   => KSL_CPT_Archive_Project::SLUG,
                'post_status' => 'any',
                'numberposts' => 1,
                'fields'      => 'ids',
                'meta_key'    => 'archive_no',
                'meta_value'  => (string) $no,
            ] );
            if ( ! $found ) {
                continue;
            }
            $post_id = (int) $found[0];
            foreach ( [ 'hero_image', 'reel_wide', 'reel_narrow', 'reel_poster' ] as $name ) {
                if ( isset( $media[ $name ] ) ) {
                    self::fill( $name, $post_id, $media[ $name ], "case study {$no} {$name}" );
                }
            }
            // A gallery is read as a whole, so it is imported as a whole: only when every
            // slot is still empty, never into the gaps of one an editor has started.
            $gallery = array_slice( $media['gallery'] ?? [], 0, KSL_ACF_Fields_Archive_Project::GALLERY_SLOTS );
            $untouched = true;
            for ( $i = 1; $i <= KSL_ACF_Fields_Archive_Project::GALLERY_SLOTS; $i++ ) {
                if ( ! self::is_empty( get_field( "gallery_{$i}", $post_id, false ) ) ) {
                    $untouched = false;
                    break;
                }
            }
            if ( $untouched ) {
                foreach ( $gallery as $i => $path ) {
                    $n = $i + 1;
                    self::fill( "gallery_{$n}", $post_id, $path, "case study {$no} gallery_{$n}" );
                }
            }
        }

        foreach ( $map['client_logos'] ?? [] as $name => $path ) {
            $post_id = self::existing_by_title( KSL_CPT_Client_Logo::SLUG, $name );
            if ( $post_id ) {
                self::fill( 'logo', $post_id, $path, "logo {$name}" );
            }
        }
    }

    private static function is_empty( $value ): bool {
        return $value === null || $value === false || $value === '' || $value === 0 || $value === '0';
    }

    /** Puts the imported copy of $path into one empty field. */
    private static function fill( string $field, int $post_id, string $path, string $label ): void {
        if ( ! self::is_empty( get_field( $field, $post_id, false ) ) ) {
            return;
        }
        $attachment = self::attachment_for( $path, $post_id );
        if ( ! $attachment ) {
            return;
        }
        update_field( $field, $attachment, $post_id );
        self::$imported++;
        WP_CLI::log( "  imported {$label} <- {$path}" );
    }

    /** The Media Library copy of one of the site's files, uploading it the first time. */
    private static function attachment_for( string $path, int $parent ): int {
        $existing = get_posts( [
            'post_type'   => 'attachment',
            'post_status' => 'any',
            'numberposts' => 1,
            'fields'      => 'ids',
            'meta_key'    => KSL_REST_Contract::DEFAULT_ASSET_META,
            'meta_value'  => $path,
        ] );
        if ( $existing ) {
            return (int) $existing[0];
        }

        $source = self::$media_from . $path;
        if ( preg_match( '#^https?://#', $source ) ) {
            $tmp = download_url( $source, 120 );
        } else {
            $tmp = wp_tempnam( basename( $path ) );
            $tmp = is_readable( $source ) && copy( $source, $tmp ) ? $tmp : new WP_Error( 'ksl_missing', "not found: {$source}" );
        }
        if ( is_wp_error( $tmp ) ) {
            WP_CLI::warning( "skipped {$path}: " . $tmp->get_error_message() );
            return 0;
        }

        $id = media_handle_sideload( [ 'name' => basename( $path ), 'tmp_name' => $tmp ], $parent );
        if ( is_wp_error( $id ) ) {
            @unlink( $tmp );
            WP_CLI::warning( "skipped {$path}: " . $id->get_error_message() );
            return 0;
        }
        update_post_meta( $id, KSL_REST_Contract::DEFAULT_ASSET_META, $path );
        return (int) $id;
    }
}

KSL_Seed_Command::register();
