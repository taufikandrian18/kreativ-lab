<?php
// tests/bootstrap.php
require_once __DIR__ . '/../vendor/autoload.php';

WP_Mock::bootstrap();

// Load every plugin class once, up front, so no test's pass/fail depends on
// another test file having required it first as a side effect (that
// dependency existed silently until a full-suite run surfaced it — see the
// implementation ledger).
require_once dirname( __DIR__ ) . '/includes/class-cpt-archive-project.php';
require_once dirname( __DIR__ ) . '/includes/class-cpt-client-logo.php';
require_once dirname( __DIR__ ) . '/includes/class-cpt-site-setting.php';
require_once dirname( __DIR__ ) . '/includes/class-acf-fields-archive-project.php';
require_once dirname( __DIR__ ) . '/includes/class-acf-fields-client-logo.php';
require_once dirname( __DIR__ ) . '/includes/class-acf-fields-site-setting.php';
require_once dirname( __DIR__ ) . '/includes/class-rest-contract.php';
require_once dirname( __DIR__ ) . '/includes/class-deploy-trigger.php';
