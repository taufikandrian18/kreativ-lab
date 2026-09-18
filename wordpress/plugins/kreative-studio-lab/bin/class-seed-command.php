<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class KSL_Seed_Command {
    public static function register(): void {
        WP_CLI::add_command( 'ksl seed', [ __CLASS__, 'seed' ] );
    }

    public static function seed(): void {
        self::seed_archive_projects();
        self::seed_client_logos();
        WP_CLI::success( 'Seeded archive_project and client_logo content.' );
    }

    private static function seed_archive_projects(): void {
        $entries = json_decode(
            file_get_contents( KSL_PLUGIN_DIR . '/data/archive-projects.json' ),
            true
        );

        foreach ( $entries as $entry ) {
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
        }
    }

    private static function seed_client_logos(): void {
        $entries = json_decode(
            file_get_contents( KSL_PLUGIN_DIR . '/data/client-logos.json' ),
            true
        );

        foreach ( $entries as $entry ) {
            $post_id = wp_insert_post( [
                'post_type'   => KSL_CPT_Client_Logo::SLUG,
                'post_title'  => $entry['name'],
                'post_status' => 'publish',
            ] );

            update_field( 'name', $entry['name'], $post_id );
            update_field( 'order', $entry['order'], $post_id );
        }
    }
}

KSL_Seed_Command::register();
