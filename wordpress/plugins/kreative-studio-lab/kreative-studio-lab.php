<?php
/**
 * Plugin Name: Kreative Studio Lab Content
 * Description: Headless content layer for the Kreative Studio Lab site. Registers CPTs, ACF field groups, the REST contract, and the Next.js revalidate webhook.
 * Version: 1.0.0
 * Requires PHP: 8.2
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'KSL_PLUGIN_FILE', __FILE__ );
define( 'KSL_PLUGIN_DIR', __DIR__ );

require_once KSL_PLUGIN_DIR . '/includes/class-cpt-archive-project.php';
require_once KSL_PLUGIN_DIR . '/includes/class-cpt-client-logo.php';
require_once KSL_PLUGIN_DIR . '/includes/class-acf-fields-archive-project.php';
require_once KSL_PLUGIN_DIR . '/includes/class-acf-fields-client-logo.php';
require_once KSL_PLUGIN_DIR . '/includes/class-acf-options-page.php';
require_once KSL_PLUGIN_DIR . '/includes/class-rest-contract.php';
require_once KSL_PLUGIN_DIR . '/includes/class-revalidate-webhook.php';

add_action( 'init', [ 'KSL_CPT_Archive_Project', 'register' ] );
add_action( 'init', [ 'KSL_CPT_Client_Logo', 'register' ] );
add_action( 'acf/init', [ 'KSL_ACF_Fields_Archive_Project', 'register' ] );
add_action( 'acf/init', [ 'KSL_ACF_Fields_Client_Logo', 'register' ] );
add_action( 'acf/init', [ 'KSL_ACF_Options_Page', 'register' ] );
add_action( 'rest_api_init', [ 'KSL_REST_Contract', 'register' ] );
add_action( 'save_post', [ 'KSL_Revalidate_Webhook', 'maybe_fire' ], 10, 2 );

if ( defined( 'WP_CLI' ) && WP_CLI ) {
    require_once KSL_PLUGIN_DIR . '/bin/class-seed-command.php';
}
