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
 */
class KSL_Seed_Command {
    /** @var bool */
    private static $refresh_copy = false;
    /** @var int */
    private static $refreshed = 0;

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
}

KSL_Seed_Command::register();
