<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Sends anyone who reaches WordPress's own front end to the real site.
 *
 * This WordPress is headless: it stores the content and the public site is a static
 * build made from it (.github/workflows/deploy.yml). Its own front end is whatever theme
 * happened to be installed — on the VPS, Twenty Twenty-Five with its "Études" demo page —
 * and "Visit Site" in the admin bar opened exactly that. Nothing there is the studio's.
 *
 * So every front-end request is redirected to the public site, a case study to its own
 * page there, and the admin bar's site links point there too. The admin, the REST API the
 * build reads, login, AJAX and cron never pass through template_redirect and are untouched.
 *
 * The public address comes from wp-config.php, falling back to the live one:
 *
 *   define( 'KSL_PUBLIC_SITE_URL', 'https://website.taufikandrian.my.id/kreative-lab' );
 */
class KSL_Public_Site {
    const DEFAULT_URL = 'https://website.taufikandrian.my.id/kreative-lab';

    public static function register(): void {
        add_action( 'template_redirect', [ __CLASS__, 'redirect' ], 0 );
        add_action( 'admin_bar_menu', [ __CLASS__, 'admin_bar' ], 100 );
    }

    /** The public site's root, without a trailing slash. */
    public static function url(): string {
        $url = defined( 'KSL_PUBLIC_SITE_URL' ) ? (string) constant( 'KSL_PUBLIC_SITE_URL' ) : '';
        return rtrim( $url !== '' ? $url : self::DEFAULT_URL, '/' );
    }

    /**
     * Where a front-end request should land. A case study goes to its page on the public
     * site; everything else — pages, posts, archives, search, 404s — to the home page.
     */
    public static function target( ?string $case_study_title = null ): string {
        if ( $case_study_title !== null && trim( $case_study_title ) !== '' ) {
            return self::url() . '/archive/' . self::slugify( $case_study_title ) . '/';
        }
        return self::url() . '/';
    }

    /**
     * Must match frontend/lib/slugify.ts, which names the case-study routes. fetch-cms and
     * the front end share the same rule; this is the third copy of it.
     */
    public static function slugify( string $title ): string {
        return trim( preg_replace( '/[^a-z0-9]+/', '-', strtolower( $title ) ), '-' );
    }

    public static function redirect(): void {
        if ( is_admin() || wp_doing_ajax() || wp_doing_cron() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
            return;
        }
        $title = is_singular( KSL_CPT_Archive_Project::SLUG ) ? get_the_title() : null;
        // 302, not 301: a permanent redirect is cached by browsers indefinitely, and the
        // public address is configuration that may yet change.
        wp_redirect( self::target( $title ), 302 );
        exit;
    }

    /** Points the admin bar's site name and "Visit Site" at the public site. */
    public static function admin_bar( $bar ): void {
        foreach ( [ 'site-name', 'view-site' ] as $id ) {
            if ( $bar->get_node( $id ) ) {
                $bar->add_node( [ 'id' => $id, 'href' => self::target() ] );
            }
        }
    }
}
