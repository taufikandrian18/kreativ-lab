<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Every editable section of the site that is not a case study, a logo or a contact detail.
 *
 * One `site_page` post per page (Home, About, Product Lab…), identified by a fixed key in
 * post meta rather than by title or slug, so an editor renaming "Home" breaks nothing.
 * The fields come from data/site-pages.json, which is also the front-end's source of
 * default copy: one file decides what is editable, what it is called in the admin, how it
 * is shaped over REST, and what the site shows when a field is left empty.
 *
 * ACF free has no repeater, flexible content or options page, so lists are textareas with
 * one item per line, parsed here into arrays; the front-end never sees raw textarea text.
 */
class KSL_Site_Pages {
    const SLUG     = 'site_page';
    const META_KEY = '_ksl_page_key';

    /** @var array|null */
    private static $schema = null;

    public static function schema(): array {
        if ( self::$schema === null ) {
            $json         = file_get_contents( dirname( __DIR__ ) . '/data/site-pages.json' );
            self::$schema = json_decode( $json, true )['pages'];
        }
        return self::$schema;
    }

    public static function page( string $key ): ?array {
        foreach ( self::schema() as $page ) {
            if ( $page['key'] === $key ) {
                return $page;
            }
        }
        return null;
    }

    /** Every value-carrying field of a page, flattened out of its sections. */
    public static function fields( array $page ): array {
        $fields = [];
        foreach ( $page['sections'] as $section ) {
            foreach ( $section['fields'] as $field ) {
                if ( $field['type'] !== 'message' ) {
                    $fields[] = $field;
                }
            }
        }
        return $fields;
    }

    public static function field_key( string $page_key, string $name ): string {
        return "field_ksl_{$page_key}_{$name}";
    }

    public static function register_post_type(): void {
        register_post_type(
            self::SLUG,
            [
                'labels'              => [
                    'name'          => __( 'Site Pages', 'kreative-studio-lab' ),
                    'singular_name' => __( 'Site Page', 'kreative-studio-lab' ),
                    'edit_item'     => __( 'Edit Site Page', 'kreative-studio-lab' ),
                ],
                // Content for the static site, never a page WordPress itself serves.
                'public'              => false,
                'publicly_queryable'  => false,
                'exclude_from_search' => true,
                'show_ui'             => true,
                'show_in_rest'        => true,
                'rest_base'           => 'site-pages',
                'supports'            => [ 'title' ],
                'menu_icon'           => 'dashicons-layout',
                'menu_position'       => 5,
                'rewrite'             => false,
                // The set of pages is fixed by the site's routes: an extra "Site Page" would
                // have nowhere to appear. `wp ksl seed` creates them; editors only edit.
                'map_meta_cap'        => true,
                'capabilities'        => [ 'create_posts' => 'do_not_allow' ],
            ]
        );
    }

    /** Hooked to acf/init. The location type must exist before the field groups use it. */
    public static function register_fields(): void {
        if ( class_exists( 'ACF_Location' ) && function_exists( 'acf_register_location_type' ) ) {
            require_once KSL_PLUGIN_DIR . '/includes/class-acf-location-site-page.php';
            acf_register_location_type( 'KSL_ACF_Location_Site_Page' );
        }

        foreach ( self::schema() as $page ) {
            acf_add_local_field_group( self::field_group( $page ) );
        }
    }

    public static function field_group( array $page ): array {
        $fields = [];
        foreach ( $page['sections'] as $section ) {
            $fields[] = [
                'key'       => self::field_key( $page['key'], 'tab_' . sanitize_key( $section['label'] ) ),
                'label'     => $section['label'],
                'name'      => '',
                'type'      => 'tab',
                'placement' => 'top',
            ];
            foreach ( $section['fields'] as $field ) {
                $fields[] = self::acf_field( $page['key'], $field );
            }
        }

        return [
            'key'                   => 'group_ksl_page_' . $page['key'],
            'title'                 => $page['title'],
            'fields'                => $fields,
            'location'              => [
                [
                    [
                        'param'    => 'ksl_site_page',
                        'operator' => '==',
                        'value'    => $page['key'],
                    ],
                ],
            ],
            'position'              => 'acf_after_title',
            'style'                 => 'seamless',
            'hide_on_screen'        => [ 'permalink', 'slug' ],
        ];
    }

    private static function acf_field( string $page_key, array $field ): array {
        $acf = [
            'key'          => self::field_key( $page_key, $field['name'] ),
            'label'        => $field['label'],
            'name'         => $field['name'],
            'instructions' => $field['instructions'] ?? '',
        ];

        switch ( $field['type'] ) {
            case 'message':
                return $acf + [ 'type' => 'message', 'message' => $field['message'], 'new_lines' => '' ];
            case 'image':
                return $acf + [ 'type' => 'image', 'return_format' => 'array', 'preview_size' => 'medium' ];
            case 'file':
                return $acf + [ 'type' => 'file', 'return_format' => 'array', 'mime_types' => 'mp4' ];
            case 'text':
                return $acf + [ 'type' => 'text' ];
            default: // textarea, lines, pairs, groups
                $rows = substr_count( $field['default'] ?? '', "\n" ) + 2;
                return $acf + [ 'type' => 'textarea', 'new_lines' => '', 'rows' => min( max( $rows, 3 ), 18 ) ];
        }
    }

    public static function register_rest_field(): void {
        register_rest_field(
            self::SLUG,
            'ksl_page',
            [ 'get_callback' => [ __CLASS__, 'get_rest_field' ] ]
        );
    }

    public static function get_rest_field( array $post ): ?array {
        $key  = get_post_meta( $post['id'], self::META_KEY, true );
        $page = $key ? self::page( $key ) : null;
        if ( ! $page ) {
            return null;
        }

        $raw = [];
        foreach ( self::fields( $page ) as $field ) {
            // By field key, not name: a key always resolves to the local field definition,
            // so ACF formats the value (an image comes back as an array, not an ID) even
            // for posts whose values were written by `wp ksl seed` rather than the editor.
            $raw[ $field['name'] ] = get_field( self::field_key( $key, $field['name'] ), $post['id'] );
        }

        return self::shape( $page, $raw );
    }

    /** The public shape of a page: structured values, never raw textarea text. */
    public static function shape( array $page, array $raw ): array {
        $out = [];
        foreach ( self::fields( $page ) as $field ) {
            $value = $raw[ $field['name'] ] ?? null;
            switch ( $field['type'] ) {
                case 'image':
                    $out[ $field['name'] ] = KSL_REST_Contract::shape_image( $value );
                    break;
                case 'file':
                    $out[ $field['name'] ] = KSL_REST_Contract::shape_file( $value );
                    break;
                case 'lines':
                    $out[ $field['name'] ] = self::parse_lines( (string) $value );
                    break;
                case 'pairs':
                    $out[ $field['name'] ] = self::parse_pairs( (string) $value );
                    break;
                case 'groups':
                    $out[ $field['name'] ] = self::parse_groups( (string) $value );
                    break;
                default:
                    $out[ $field['name'] ] = is_string( $value ) ? trim( $value ) : '';
            }
        }
        return [ 'key' => $page['key'], 'fields' => $out ];
    }

    // The three parsers below have exact twins in frontend/lib/site-content.ts, which
    // applies them to the defaults. site-content.test.ts and SitePagesTest.php feed both
    // the same inputs.

    public static function parse_lines( string $text ): array {
        $lines = preg_split( '/\r\n|\r|\n/', $text );
        return array_values( array_filter( array_map( 'trim', $lines ), fn( $l ) => $l !== '' ) );
    }

    /** "It begins | with understanding." → ['first' => 'It begins', 'second' => 'with understanding.'] */
    public static function parse_pairs( string $text ): array {
        return array_map(
            function ( $line ) {
                $parts = array_map( 'trim', explode( '|', $line, 2 ) );
                return [ 'first' => $parts[0], 'second' => $parts[1] ?? '' ];
            },
            self::parse_lines( $text )
        );
    }

    /** A line ending in ":" opens a named group; other lines are items of the current one. */
    public static function parse_groups( string $text ): array {
        $groups = [];
        foreach ( self::parse_lines( $text ) as $line ) {
            if ( substr( $line, -1 ) === ':' ) {
                $groups[] = [ 'name' => trim( substr( $line, 0, -1 ) ), 'items' => [] ];
                continue;
            }
            if ( empty( $groups ) ) {
                $groups[] = [ 'name' => '', 'items' => [] ];
            }
            $groups[ count( $groups ) - 1 ]['items'][] = $line;
        }
        return array_values( array_filter( $groups, fn( $g ) => ! empty( $g['items'] ) ) );
    }
}
