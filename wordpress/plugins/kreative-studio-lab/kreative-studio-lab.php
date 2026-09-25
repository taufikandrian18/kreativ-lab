<?php
/**
 * Plugin Name: Kreative Studio Lab Content
 * Description: Headless content layer for the Kreative Studio Lab site. Registers CPTs, ACF field groups (including every editable site section), the REST contract, and the GitHub deploy trigger.
 * Version: 1.3.0
 * Requires PHP: 8.2
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'KSL_PLUGIN_FILE', __FILE__ );
define( 'KSL_PLUGIN_DIR', __DIR__ );

require_once KSL_PLUGIN_DIR . '/includes/class-cpt-archive-project.php';
require_once KSL_PLUGIN_DIR . '/includes/class-cpt-client-logo.php';
require_once KSL_PLUGIN_DIR . '/includes/class-cpt-site-setting.php';
require_once KSL_PLUGIN_DIR . '/includes/class-acf-fields-archive-project.php';
require_once KSL_PLUGIN_DIR . '/includes/class-acf-fields-client-logo.php';
require_once KSL_PLUGIN_DIR . '/includes/class-acf-fields-site-setting.php';
require_once KSL_PLUGIN_DIR . '/includes/class-rest-contract.php';
require_once KSL_PLUGIN_DIR . '/includes/class-site-pages.php';
require_once KSL_PLUGIN_DIR . '/includes/class-deploy-trigger.php';
require_once KSL_PLUGIN_DIR . '/includes/class-public-site.php';

add_action( 'init', [ 'KSL_CPT_Archive_Project', 'register' ] );
add_action( 'init', [ 'KSL_CPT_Client_Logo', 'register' ] );
add_action( 'init', [ 'KSL_CPT_Site_Setting', 'register' ] );
add_action( 'acf/init', [ 'KSL_ACF_Fields_Archive_Project', 'register' ] );
add_action( 'acf/init', [ 'KSL_ACF_Fields_Client_Logo', 'register' ] );
add_action( 'acf/init', [ 'KSL_ACF_Fields_Site_Setting', 'register' ] );
add_action( 'init', [ 'KSL_Site_Pages', 'register_post_type' ] );
add_action( 'acf/init', [ 'KSL_Site_Pages', 'register_fields' ] );
add_action( 'rest_api_init', [ 'KSL_REST_Contract', 'register' ] );
add_action( 'rest_api_init', [ 'KSL_Site_Pages', 'register_rest_field' ] );
add_action( 'transition_post_status', [ 'KSL_Deploy_Trigger', 'maybe_fire' ], 10, 3 );
KSL_Public_Site::register();

if ( defined( 'WP_CLI' ) && WP_CLI ) {
    require_once KSL_PLUGIN_DIR . '/bin/class-seed-command.php';
}
