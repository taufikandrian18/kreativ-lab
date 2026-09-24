<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Asks GitHub to rebuild and redeploy the site when published content changes.
 *
 * The front-end is a static export on the VPS, with no Node process to receive a
 * revalidate call. A content change therefore means a fresh build, and the build runs in
 * GitHub Actions (.github/workflows/deploy.yml), which listens for this repository_dispatch
 * event, reads the content back over REST, and publishes the result.
 *
 * Configured in wp-config.php (constants win over environment variables, because PHP-FPM
 * does not pass the environment through by default):
 *
 *   define( 'KSL_GITHUB_REPO',  'owner/repo' );
 *   define( 'KSL_GITHUB_TOKEN', 'github_pat_...' ); // fine-grained, this repo only,
 *                                                   // Contents: read and write
 *
 * With either missing, nothing fires and editing works as normal; the site just waits
 * for the next manual deploy.
 */
class KSL_Deploy_Trigger {
    const EVENT_TYPE = 'cms-publish';

    const RELEVANT_TYPES = [
        'archive_project',
        'client_logo',
        'site_setting',
        'site_page',
    ];

    /**
     * Hooked to transition_post_status rather than save_post so that taking content down
     * counts too: unpublishing or trashing a case study must remove it from the site, and
     * only the old status says it was ever live. Draft-to-draft saves change nothing
     * public, so they do not spend a build.
     */
    public static function maybe_fire( string $new_status, string $old_status, $post ): void {
        if ( $new_status !== 'publish' && $old_status !== 'publish' ) {
            return;
        }

        if ( ! in_array( $post->post_type, self::RELEVANT_TYPES, true ) ) {
            return;
        }

        $repo  = self::config( 'KSL_GITHUB_REPO' );
        $token = self::config( 'KSL_GITHUB_TOKEN' );
        if ( ! $repo || ! $token ) {
            return;
        }

        wp_remote_post( "https://api.github.com/repos/{$repo}/dispatches", [
            'headers'  => [
                'Accept'               => 'application/vnd.github+json',
                'Authorization'        => 'Bearer ' . $token,
                'Content-Type'         => 'application/json',
                'X-GitHub-Api-Version' => '2022-11-28',
            ],
            'body'     => wp_json_encode( [
                'event_type'     => self::EVENT_TYPE,
                'client_payload' => [
                    'post_type' => $post->post_type,
                    'post_id'   => $post->ID,
                    'status'    => $new_status,
                ],
            ] ),
            'timeout'  => 5,
            // Saving a post must not wait on GitHub. A lost request costs one build, and
            // the next publish (or a manual run of the workflow) catches up.
            'blocking' => false,
        ] );
    }

    private static function config( string $name ): string {
        if ( defined( $name ) ) {
            return (string) constant( $name );
        }
        return (string) getenv( $name );
    }
}
