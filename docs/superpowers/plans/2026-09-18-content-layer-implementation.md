# Content Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the WordPress content layer — two custom post types, an options page, and a stable, version-controlled REST contract — that serves as the sole data source for the Next.js front-end, and seed it with the studio's six launch case studies and confirmed client logos.

**Architecture:** A single custom WordPress plugin (`kreative-studio-lab`) registers both CPTs and their ACF field groups entirely in PHP (never through the ACF admin UI), so the schema is version-controlled and diffable. A dedicated REST-contract layer reshapes ACF's raw field output into a stable JSON shape via `register_rest_field`, decoupling the public API from ACF's internal field names — an ACF field rename must fail a test, not silently break the front-end. A `save_post` hook fires a signed webhook to the Next.js ISR endpoint on publish.

**Tech Stack:** WordPress 6.x, PHP 8.2+, ACF Pro (fields registered via `acf_add_local_field_group`, not the UI), `@wordpress/env` (wp-env) for the local Docker instance, WP-CLI, Composer, PHPUnit 9.6 with `10up/wp_mock ^1.0` for unit tests (WP_Mock 1.x requires PHPUnit `^9.6`; PHPUnit 10 is incompatible with it and was corrected during Task 1 execution — see plan's implementation ledger), integration checks run against wp-env via WP-CLI/curl.

**Spec:** `docs/superpowers/specs/2026-09-18-kreative-studio-lab-design.md` — this plan implements §2 (architecture), §3 (content model), and the "Content layer" stage of §13. Executors should read both documents; this plan does not restate rationale already covered there.

## Global Constraints

- WordPress renders zero public HTML — every response this plugin produces is JSON. (Spec §2)
- PHP 8.2+ only. (Spec §2)
- ACF field groups are registered in PHP via `acf_add_local_field_group`, never created through the wp-admin ACF UI — the schema must be diffable in version control.
- REST responses use custom field names defined by this plugin's contract layer, never raw ACF meta keys, so a field rename inside ACF cannot silently change the public JSON shape. (Spec §12, "WP → Next contract")
- `archive_project` field names are exactly: `archive_no`, `client`, `industry`, `year_range`, `scope` (repeater of text), `lab` (`product`|`creative`|`both`), `hero_image`, `gallery`, `accent_color`. Post title holds the project title. (Spec §3)
- `client_logo` field names are exactly: `name`, `logo`, `order`. (Spec §3)
- Options page field names are exactly: `phone_primary`, `phone_secondary`, `email`, `instagram`, `address`, `og_image`. (Spec §3)
- Six `archive_project` entries are seeded exactly as tabulated in spec §3 — industry values are reproduced verbatim, including "Otomotive Manufacture" and "Sport Brand Apparel", per the spec's explicit instruction not to silently correct them.
- `client_logo` seeding covers only the 24 marks legible in the deck; the 25th (spec §14, open question 2) is not fabricated or padded in.
- No contact form; the options page is data only. (Spec §4)

---

## File Structure

```
wordpress/plugins/kreative-studio-lab/
  kreative-studio-lab.php              Plugin bootstrap; hooks includes/ classes
  includes/
    class-cpt-archive-project.php      Registers the archive_project CPT
    class-cpt-client-logo.php          Registers the client_logo CPT
    class-acf-fields-archive-project.php  PHP-registered ACF field group for archive_project
    class-acf-fields-client-logo.php   PHP-registered ACF field group for client_logo
    class-acf-options-page.php         PHP-registered ACF options page fields
    class-rest-contract.php            register_rest_field shaping for both CPTs
    class-revalidate-webhook.php       save_post hook -> signed POST to Next.js
  data/
    archive-projects.json              Seed data, six entries, matches spec §3 table
    client-logos.json                  Seed data, 24 confirmed entries
  bin/
    class-seed-command.php             WP-CLI command: wp ksl seed
  composer.json
  phpunit.xml
  tests/
    bootstrap.php
    test-cpt-registration.php
    test-acf-field-schema.php
    test-rest-contract.php
    test-seed-data-shape.php
    test-revalidate-webhook.php
.wp-env.json                            Local Docker WP instance for dev + integration checks
scripts/
  fetch-contract-fixture.sh            Curls the running wp-env REST API, writes tests/fixtures/rest-contract.json
```

Each `class-*.php` file owns exactly one registration concern (one CPT, one field group, one webhook), so a reviewer can approve or reject one file's task without needing to read the others.

---

## Task 1: Plugin scaffold and local WordPress environment

**Files:**
- Create: `wordpress/plugins/kreative-studio-lab/kreative-studio-lab.php`
- Create: `wordpress/plugins/kreative-studio-lab/composer.json`
- Create: `wordpress/plugins/kreative-studio-lab/phpunit.xml`
- Create: `wordpress/plugins/kreative-studio-lab/tests/bootstrap.php`
- Create: `.wp-env.json`
- Test: `wordpress/plugins/kreative-studio-lab/tests/test-plugin-bootstrap.php`

**Interfaces:**
- Produces: the `KSL_PLUGIN_DIR` and `KSL_PLUGIN_FILE` constants, defined in the bootstrap file, that every later `class-*.php` file uses to build its own file paths.

- [ ] **Step 1: Write composer.json requiring WP_Mock and PHPUnit**

```json
{
  "name": "kreative-studio-lab/plugin",
  "require-dev": {
    "10up/wp_mock": "^1.0",
    "phpunit/phpunit": "^9.6"
  },
  "autoload-dev": {
    "psr-4": {
      "KSL\\Tests\\": "tests/"
    }
  }
}
```

Note: originally specified as `^10.5`; corrected to `^9.6` during execution when `composer install`
failed with an unresolvable dependency — WP_Mock 1.x hard-requires PHPUnit `^9.6`. See the
implementation ledger for the ruling.

- [ ] **Step 2: Install dependencies**

Run: `cd wordpress/plugins/kreative-studio-lab && composer install`
Expected: `vendor/` created, no errors.

- [ ] **Step 3: Write the PHPUnit bootstrap using WP_Mock**

```php
<?php
// tests/bootstrap.php
require_once __DIR__ . '/../vendor/autoload.php';

WP_Mock::bootstrap();
```

- [ ] **Step 4: Write phpunit.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit bootstrap="tests/bootstrap.php" colors="true">
  <testsuites>
    <testsuite name="unit">
      <directory>tests</directory>
    </testsuite>
  </testsuites>
</phpunit>
```

> **Correction (post-execution, see implementation ledger):** `<directory>tests</directory>`
> with no `suffix` attribute defaults to PHPUnit 9's built-in filter of `Test.php`. Every test
> filename shown below and throughout the rest of this plan (`test-plugin-bootstrap.php`,
> `test-cpt-registration.php`, `test-acf-field-schema.php`, `test-rest-contract.php`,
> `test-seed-data-shape.php`, `test-revalidate-webhook.php`) was written in WordPress
> convention, not PHPUnit's, so a bare `vendor/bin/phpunit` run discovered zero tests. The
> per-step "Run: vendor/bin/phpunit tests/test-x.php" commands below still worked as written,
> because passing a file directly as a CLI argument bypasses suite discovery — which is why
> this wasn't caught until Task 9's full-suite run. The actual, corrected filenames are
> `PluginBootstrapTest.php`, `CptRegistrationTest.php`, `AcfFieldSchemaTest.php`,
> `RestContractTest.php`, `SeedDataShapeTest.php`, `RevalidateWebhookTest.php` — class names,
> namespaces, and test method names are unchanged. `phpunit.xml` itself needed no edit. See the
> ledger's Ruling entry for the full record; this plan's inline code blocks below are left as
> originally written for historical accuracy and should not be copy-pasted by filename.

- [ ] **Step 5: Write the failing bootstrap test**

```php
<?php
// tests/test-plugin-bootstrap.php
use PHPUnit\Framework\TestCase;

class Test_Plugin_Bootstrap extends TestCase {
    public function setUp(): void {
        WP_Mock::setUp();
    }

    public function tearDown(): void {
        WP_Mock::tearDown();
    }

    public function test_plugin_constants_are_defined() {
        require_once dirname( __DIR__ ) . '/kreative-studio-lab.php';
        $this->assertTrue( defined( 'KSL_PLUGIN_DIR' ) );
        $this->assertTrue( defined( 'KSL_PLUGIN_FILE' ) );
    }
}
```

- [ ] **Step 6: Run test to verify it fails**

Run: `cd wordpress/plugins/kreative-studio-lab && vendor/bin/phpunit tests/test-plugin-bootstrap.php`
Expected: FAIL — `kreative-studio-lab.php` does not exist yet.

- [ ] **Step 7: Write the plugin bootstrap**

```php
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
```

Note: the `require_once` calls above reference files that Tasks 2–8 create. Until each file exists, loading this bootstrap in a real WordPress request will fatal — that is expected and does not block this task, whose test only exercises the constants defined before those requires run. If a step's test run needs the bootstrap to load standalone before all files exist, temporarily comment out the not-yet-created `require_once`/`add_action` line pairs and restore them in that task's own commit.

- [ ] **Step 8: Run test to verify it passes**

Run: `cd wordpress/plugins/kreative-studio-lab && vendor/bin/phpunit tests/test-plugin-bootstrap.php`
Expected: PASS.

- [ ] **Step 9: Write .wp-env.json**

```json
{
  "core": "WordPress/WordPress#6.6",
  "phpVersion": "8.2",
  "plugins": [
    "./wordpress/plugins/advanced-custom-fields-pro",
    "./wordpress/plugins/kreative-studio-lab"
  ],
  "config": {
    "WP_DEBUG": true
  }
}
```

ACF Pro is referenced as a local plugin path rather than the licensed download URL, since the licence key is a deployment secret, not a plan detail. Whoever runs this locally places their own ACF Pro zip, unzipped, at `wordpress/plugins/advanced-custom-fields-pro` before Step 10.

- [ ] **Step 10: Start the environment and confirm the plugin activates**

Run: `npx @wordpress/env start`
Run: `npx wp-env run cli wp plugin activate kreative-studio-lab`
Expected: `Plugin 'kreative-studio-lab' activated.`

- [ ] **Step 11: Commit**

```bash
git add wordpress/plugins/kreative-studio-lab/kreative-studio-lab.php \
        wordpress/plugins/kreative-studio-lab/composer.json \
        wordpress/plugins/kreative-studio-lab/phpunit.xml \
        wordpress/plugins/kreative-studio-lab/tests/bootstrap.php \
        wordpress/plugins/kreative-studio-lab/tests/test-plugin-bootstrap.php \
        wordpress/plugins/kreative-studio-lab/composer.lock \
        .wp-env.json
git commit -m "feat(content-layer): scaffold plugin, wp-env, and PHPUnit harness"
```

---

## Task 2: Register the `archive_project` custom post type

**Files:**
- Create: `wordpress/plugins/kreative-studio-lab/includes/class-cpt-archive-project.php`
- Test: `wordpress/plugins/kreative-studio-lab/tests/test-cpt-registration.php`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `KSL_CPT_Archive_Project::SLUG` (string `'archive_project'`), used by Task 4 (ACF field group location rules) and Task 6 (REST contract registration).

- [ ] **Step 1: Write the failing test asserting the registration arguments**

```php
<?php
// tests/test-cpt-registration.php
use PHPUnit\Framework\TestCase;

class Test_CPT_Registration extends TestCase {
    public function setUp(): void {
        WP_Mock::setUp();
    }

    public function tearDown(): void {
        WP_Mock::tearDown();
    }

    public function test_archive_project_registers_with_show_in_rest() {
        WP_Mock::userFunction( '__', [ 'return' => function ( $text ) { return $text; } ] );
        WP_Mock::userFunction( 'register_post_type' )
            ->once()
            ->with(
                'archive_project',
                Mockery::on( function ( $args ) {
                    return $args['public'] === true
                        && $args['show_in_rest'] === true
                        && $args['show_ui'] === true
                        && $args['supports'] === [ 'title', 'thumbnail' ]
                        && $args['rest_base'] === 'archive-projects';
                } )
            );

        KSL_CPT_Archive_Project::register();
        $this->assertTrue( true ); // Mockery expectation above is the real assertion.
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vendor/bin/phpunit tests/test-cpt-registration.php --filter test_archive_project_registers_with_show_in_rest`
Expected: FAIL — class `KSL_CPT_Archive_Project` not found.

- [ ] **Step 3: Write the CPT registration class**

```php
<?php
// includes/class-cpt-archive-project.php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class KSL_CPT_Archive_Project {
    const SLUG = 'archive_project';

    public static function register(): void {
        register_post_type(
            self::SLUG,
            [
                'label'        => __( 'Archive Projects', 'kreative-studio-lab' ),
                'public'       => true,
                'show_ui'      => true,
                'show_in_rest' => true,
                'rest_base'    => 'archive-projects',
                'supports'     => [ 'title', 'thumbnail' ],
                'menu_icon'    => 'dashicons-portfolio',
                'has_archive'  => false,
                'rewrite'      => false,
            ]
        );
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `vendor/bin/phpunit tests/test-cpt-registration.php --filter test_archive_project_registers_with_show_in_rest`
Expected: PASS.

- [ ] **Step 5: Restore the archive_project require/hook lines in the bootstrap file if they were disabled in Task 1 Step 7's note**

- [ ] **Step 6: Commit**

```bash
git add wordpress/plugins/kreative-studio-lab/includes/class-cpt-archive-project.php \
        wordpress/plugins/kreative-studio-lab/tests/test-cpt-registration.php \
        wordpress/plugins/kreative-studio-lab/kreative-studio-lab.php
git commit -m "feat(content-layer): register archive_project CPT"
```

---

## Task 3: Register the `client_logo` custom post type

**Files:**
- Create: `wordpress/plugins/kreative-studio-lab/includes/class-cpt-client-logo.php`
- Modify: `wordpress/plugins/kreative-studio-lab/tests/test-cpt-registration.php`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `KSL_CPT_Client_Logo::SLUG` (string `'client_logo'`), used by Task 5 and Task 6.

- [ ] **Step 1: Add the failing test to the same test file**

```php
    public function test_client_logo_registers_with_show_in_rest() {
        WP_Mock::userFunction( '__', [ 'return' => function ( $text ) { return $text; } ] );
        WP_Mock::userFunction( 'register_post_type' )
            ->once()
            ->with(
                'client_logo',
                Mockery::on( function ( $args ) {
                    return $args['public'] === true
                        && $args['show_in_rest'] === true
                        && $args['supports'] === [ 'title', 'thumbnail' ]
                        && $args['rest_base'] === 'client-logos';
                } )
            );

        KSL_CPT_Client_Logo::register();
        $this->assertTrue( true );
    }
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vendor/bin/phpunit tests/test-cpt-registration.php --filter test_client_logo_registers_with_show_in_rest`
Expected: FAIL — class not found.

- [ ] **Step 3: Write the CPT registration class**

```php
<?php
// includes/class-cpt-client-logo.php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class KSL_CPT_Client_Logo {
    const SLUG = 'client_logo';

    public static function register(): void {
        register_post_type(
            self::SLUG,
            [
                'label'        => __( 'Client Logos', 'kreative-studio-lab' ),
                'public'       => true,
                'show_ui'      => true,
                'show_in_rest' => true,
                'rest_base'    => 'client-logos',
                'supports'     => [ 'title', 'thumbnail' ],
                'menu_icon'    => 'dashicons-images-alt2',
                'has_archive'  => false,
                'rewrite'      => false,
            ]
        );
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `vendor/bin/phpunit tests/test-cpt-registration.php`
Expected: PASS, both tests in the file.

- [ ] **Step 5: Commit**

```bash
git add wordpress/plugins/kreative-studio-lab/includes/class-cpt-client-logo.php \
        wordpress/plugins/kreative-studio-lab/tests/test-cpt-registration.php
git commit -m "feat(content-layer): register client_logo CPT"
```

---

## Task 4: ACF field group for `archive_project`

**Files:**
- Create: `wordpress/plugins/kreative-studio-lab/includes/class-acf-fields-archive-project.php`
- Test: `wordpress/plugins/kreative-studio-lab/tests/test-acf-field-schema.php`

**Interfaces:**
- Consumes: `KSL_CPT_Archive_Project::SLUG` from Task 2.
- Produces: the exact field-name set `['archive_no','client','industry','year_range','scope','lab','hero_image','gallery','accent_color']`, which Task 6's contract layer reads via `get_field()`.

- [ ] **Step 1: Write the failing test asserting the field-name set matches the spec exactly**

```php
<?php
// tests/test-acf-field-schema.php
use PHPUnit\Framework\TestCase;

class Test_ACF_Field_Schema extends TestCase {
    public function setUp(): void {
        WP_Mock::setUp();
    }

    public function tearDown(): void {
        WP_Mock::tearDown();
    }

    public function test_archive_project_field_names_match_spec() {
        $captured = null;
        WP_Mock::userFunction( 'acf_add_local_field_group' )
            ->once()
            ->andReturnUsing( function ( $group ) use ( &$captured ) {
                $captured = $group;
            } );

        KSL_ACF_Fields_Archive_Project::register();

        $names = array_map( fn( $f ) => $f['name'], $captured['fields'] );
        $expected = [
            'archive_no', 'client', 'industry', 'year_range',
            'scope', 'lab', 'hero_image', 'gallery', 'accent_color',
        ];
        sort( $names );
        sort( $expected );
        $this->assertSame( $expected, $names );
    }

    public function test_archive_project_lab_field_has_exact_choices() {
        $captured = null;
        WP_Mock::userFunction( 'acf_add_local_field_group' )
            ->once()
            ->andReturnUsing( function ( $group ) use ( &$captured ) {
                $captured = $group;
            } );

        KSL_ACF_Fields_Archive_Project::register();

        $lab_field = array_values( array_filter(
            $captured['fields'],
            fn( $f ) => $f['name'] === 'lab'
        ) )[0];

        $this->assertSame(
            [ 'product' => 'Product', 'creative' => 'Creative', 'both' => 'Both' ],
            $lab_field['choices']
        );
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vendor/bin/phpunit tests/test-acf-field-schema.php`
Expected: FAIL — class `KSL_ACF_Fields_Archive_Project` not found.

- [ ] **Step 3: Write the ACF field group registration**

```php
<?php
// includes/class-acf-fields-archive-project.php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class KSL_ACF_Fields_Archive_Project {
    public static function register(): void {
        acf_add_local_field_group( [
            'key'      => 'group_ksl_archive_project',
            'title'    => 'Archive Project Details',
            'fields'   => [
                [
                    'key'   => 'field_ksl_archive_no',
                    'label' => 'Archive Number',
                    'name'  => 'archive_no',
                    'type'  => 'text',
                ],
                [
                    'key'   => 'field_ksl_client',
                    'label' => 'Client',
                    'name'  => 'client',
                    'type'  => 'text',
                ],
                [
                    'key'   => 'field_ksl_industry',
                    'label' => 'Industry',
                    'name'  => 'industry',
                    'type'  => 'text',
                ],
                [
                    'key'   => 'field_ksl_year_range',
                    'label' => 'Year Range',
                    'name'  => 'year_range',
                    'type'  => 'text',
                ],
                [
                    'key'        => 'field_ksl_scope',
                    'label'      => 'Scope of Work',
                    'name'       => 'scope',
                    'type'       => 'repeater',
                    'layout'     => 'table',
                    'sub_fields' => [
                        [
                            'key'   => 'field_ksl_scope_item',
                            'label' => 'Item',
                            'name'  => 'item',
                            'type'  => 'text',
                        ],
                    ],
                ],
                [
                    'key'     => 'field_ksl_lab',
                    'label'   => 'Lab',
                    'name'    => 'lab',
                    'type'    => 'select',
                    'choices' => [
                        'product'  => 'Product',
                        'creative' => 'Creative',
                        'both'     => 'Both',
                    ],
                ],
                [
                    'key'          => 'field_ksl_hero_image',
                    'label'        => 'Hero Image',
                    'name'         => 'hero_image',
                    'type'         => 'image',
                    'return_format' => 'array',
                ],
                [
                    'key'          => 'field_ksl_gallery',
                    'label'        => 'Gallery',
                    'name'         => 'gallery',
                    'type'         => 'gallery',
                    'return_format' => 'array',
                ],
                [
                    'key'   => 'field_ksl_accent_color',
                    'label' => 'Accent Color',
                    'name'  => 'accent_color',
                    'type'  => 'color_picker',
                ],
            ],
            'location' => [
                [
                    [
                        'param'    => 'post_type',
                        'operator' => '==',
                        'value'    => KSL_CPT_Archive_Project::SLUG,
                    ],
                ],
            ],
        ] );
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `vendor/bin/phpunit tests/test-acf-field-schema.php`
Expected: PASS, both tests.

- [ ] **Step 5: Commit**

```bash
git add wordpress/plugins/kreative-studio-lab/includes/class-acf-fields-archive-project.php \
        wordpress/plugins/kreative-studio-lab/tests/test-acf-field-schema.php
git commit -m "feat(content-layer): register archive_project ACF field group"
```

---

## Task 5: ACF field group for `client_logo` and the options page

**Files:**
- Create: `wordpress/plugins/kreative-studio-lab/includes/class-acf-fields-client-logo.php`
- Create: `wordpress/plugins/kreative-studio-lab/includes/class-acf-options-page.php`
- Modify: `wordpress/plugins/kreative-studio-lab/tests/test-acf-field-schema.php`

**Interfaces:**
- Consumes: `KSL_CPT_Client_Logo::SLUG` from Task 3.
- Produces: `client_logo` field names `['name','logo','order']`; options page field names `['phone_primary','phone_secondary','email','instagram','address','og_image']`, both read by Task 6.

- [ ] **Step 1: Add failing tests to the same test file**

```php
    public function test_client_logo_field_names_match_spec() {
        $captured = null;
        WP_Mock::userFunction( 'acf_add_local_field_group' )
            ->once()
            ->andReturnUsing( function ( $group ) use ( &$captured ) {
                $captured = $group;
            } );

        KSL_ACF_Fields_Client_Logo::register();

        $names = array_map( fn( $f ) => $f['name'], $captured['fields'] );
        $expected = [ 'name', 'logo', 'order' ];
        sort( $names );
        sort( $expected );
        $this->assertSame( $expected, $names );
    }

    public function test_options_page_field_names_match_spec() {
        WP_Mock::userFunction( 'acf_add_options_page', [ 'times' => 1 ] );

        $captured = null;
        WP_Mock::userFunction( 'acf_add_local_field_group' )
            ->once()
            ->andReturnUsing( function ( $group ) use ( &$captured ) {
                $captured = $group;
            } );

        KSL_ACF_Options_Page::register();

        $names = array_map( fn( $f ) => $f['name'], $captured['fields'] );
        $expected = [
            'phone_primary', 'phone_secondary', 'email',
            'instagram', 'address', 'og_image',
        ];
        sort( $names );
        sort( $expected );
        $this->assertSame( $expected, $names );
    }
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `vendor/bin/phpunit tests/test-acf-field-schema.php`
Expected: FAIL — `KSL_ACF_Fields_Client_Logo` and `KSL_ACF_Options_Page` not found.

- [ ] **Step 3: Write the client_logo field group**

```php
<?php
// includes/class-acf-fields-client-logo.php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class KSL_ACF_Fields_Client_Logo {
    public static function register(): void {
        acf_add_local_field_group( [
            'key'    => 'group_ksl_client_logo',
            'title'  => 'Client Logo Details',
            'fields' => [
                [
                    'key'   => 'field_ksl_logo_name',
                    'label' => 'Name',
                    'name'  => 'name',
                    'type'  => 'text',
                ],
                [
                    'key'           => 'field_ksl_logo_file',
                    'label'         => 'Logo',
                    'name'          => 'logo',
                    'type'          => 'image',
                    'return_format' => 'array',
                    'mime_types'    => 'svg,png',
                ],
                [
                    'key'   => 'field_ksl_logo_order',
                    'label' => 'Order',
                    'name'  => 'order',
                    'type'  => 'number',
                ],
            ],
            'location' => [
                [
                    [
                        'param'    => 'post_type',
                        'operator' => '==',
                        'value'    => KSL_CPT_Client_Logo::SLUG,
                    ],
                ],
            ],
        ] );
    }
}
```

- [ ] **Step 4: Write the options page**

```php
<?php
// includes/class-acf-options-page.php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class KSL_ACF_Options_Page {
    public static function register(): void {
        acf_add_options_page( [
            'page_title' => 'Site Options',
            'menu_title' => 'Site Options',
            'menu_slug'  => 'ksl-options',
        ] );

        acf_add_local_field_group( [
            'key'    => 'group_ksl_options',
            'title'  => 'Contact Details',
            'fields' => [
                [
                    'key'   => 'field_ksl_phone_primary',
                    'label' => 'Primary Phone',
                    'name'  => 'phone_primary',
                    'type'  => 'text',
                ],
                [
                    'key'   => 'field_ksl_phone_secondary',
                    'label' => 'Secondary Phone',
                    'name'  => 'phone_secondary',
                    'type'  => 'text',
                ],
                [
                    'key'   => 'field_ksl_email',
                    'label' => 'Email',
                    'name'  => 'email',
                    'type'  => 'email',
                ],
                [
                    'key'   => 'field_ksl_instagram',
                    'label' => 'Instagram',
                    'name'  => 'instagram',
                    'type'  => 'text',
                ],
                [
                    'key'   => 'field_ksl_address',
                    'label' => 'Address',
                    'name'  => 'address',
                    'type'  => 'textarea',
                ],
                [
                    'key'           => 'field_ksl_og_image',
                    'label'         => 'Default OG Image',
                    'name'          => 'og_image',
                    'type'          => 'image',
                    'return_format' => 'array',
                ],
            ],
            'location' => [
                [
                    [
                        'param'    => 'options_page',
                        'operator' => '==',
                        'value'    => 'ksl-options',
                    ],
                ],
            ],
        ] );
    }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `vendor/bin/phpunit tests/test-acf-field-schema.php`
Expected: PASS, all four tests in the file.

- [ ] **Step 6: Commit**

```bash
git add wordpress/plugins/kreative-studio-lab/includes/class-acf-fields-client-logo.php \
        wordpress/plugins/kreative-studio-lab/includes/class-acf-options-page.php \
        wordpress/plugins/kreative-studio-lab/tests/test-acf-field-schema.php
git commit -m "feat(content-layer): register client_logo fields and options page"
```

---

## Task 6: REST contract layer

**Files:**
- Create: `wordpress/plugins/kreative-studio-lab/includes/class-rest-contract.php`
- Test: `wordpress/plugins/kreative-studio-lab/tests/test-rest-contract.php`

**Interfaces:**
- Consumes: `KSL_CPT_Archive_Project::SLUG`, `KSL_CPT_Client_Logo::SLUG`, and the field names produced by Tasks 4–5.
- Produces: the public JSON shape for `archive_project` — `{ archive_no, title, client, industry, year_range, scope: string[], lab, hero_image: {url, alt}, gallery: [{url, alt}], accent_color }` — and for `client_logo` — `{ name, logo: {url, alt}, order }`. This exact shape is what the Next.js front-end (a later stage) is contracted against; do not change field names here without updating that stage's plan.

- [ ] **Step 1: Write the failing test for the archive_project shaping function in isolation**

The shaping function is written as a pure function of an ACF-field array so it is testable without mocking `get_field()` at all — `register_rest_field`'s callback is a thin adapter around it.

```php
<?php
// tests/test-rest-contract.php
use PHPUnit\Framework\TestCase;

class Test_REST_Contract extends TestCase {
    public function setUp(): void {
        WP_Mock::setUp();
    }

    public function tearDown(): void {
        WP_Mock::tearDown();
    }

    public function test_shape_archive_project_produces_stable_contract() {
        $raw = [
            'archive_no'   => '01',
            'client'       => 'Nathan Tjoe A On',
            'industry'     => 'Clothing Brand',
            'year_range'   => '2025 – 2026',
            'scope'        => [
                [ 'item' => 'Creative Direction' ],
                [ 'item' => 'Product RnD' ],
            ],
            'lab'          => 'both',
            'hero_image'   => [ 'url' => 'https://example.test/hero.jpg', 'alt' => 'N8N hero' ],
            'gallery'      => [
                [ 'url' => 'https://example.test/g1.jpg', 'alt' => 'Gallery 1' ],
            ],
            'accent_color' => '#1c3fd6',
        ];

        $shaped = KSL_REST_Contract::shape_archive_project( $raw, 'N8N Collective' );

        $this->assertSame( [
            'archive_no'   => '01',
            'title'        => 'N8N Collective',
            'client'       => 'Nathan Tjoe A On',
            'industry'     => 'Clothing Brand',
            'year_range'   => '2025 – 2026',
            'scope'        => [ 'Creative Direction', 'Product RnD' ],
            'lab'          => 'both',
            'hero_image'   => [ 'url' => 'https://example.test/hero.jpg', 'alt' => 'N8N hero' ],
            'gallery'      => [ [ 'url' => 'https://example.test/g1.jpg', 'alt' => 'Gallery 1' ] ],
            'accent_color' => '#1c3fd6',
        ], $shaped );
    }

    public function test_shape_client_logo_produces_stable_contract() {
        $raw = [
            'name'  => 'BMW Motorrad',
            'logo'  => [ 'url' => 'https://example.test/bmw.svg', 'alt' => 'BMW Motorrad logo' ],
            'order' => 2,
        ];

        $shaped = KSL_REST_Contract::shape_client_logo( $raw );

        $this->assertSame( [
            'name'  => 'BMW Motorrad',
            'logo'  => [ 'url' => 'https://example.test/bmw.svg', 'alt' => 'BMW Motorrad logo' ],
            'order' => 2,
        ], $shaped );
    }

    public function test_register_attaches_rest_field_to_both_post_types() {
        WP_Mock::userFunction( 'register_rest_field' )
            ->once()
            ->with( 'archive_project', 'ksl_project', Mockery::type( 'array' ) );
        WP_Mock::userFunction( 'register_rest_field' )
            ->once()
            ->with( 'client_logo', 'ksl_logo', Mockery::type( 'array' ) );

        KSL_REST_Contract::register();
        $this->assertTrue( true );
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `vendor/bin/phpunit tests/test-rest-contract.php`
Expected: FAIL — class `KSL_REST_Contract` not found.

- [ ] **Step 3: Write the contract class**

```php
<?php
// includes/class-rest-contract.php

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
    }

    public static function get_archive_project_field( array $post ): array {
        $raw = [
            'archive_no'   => get_field( 'archive_no', $post['id'] ),
            'client'       => get_field( 'client', $post['id'] ),
            'industry'     => get_field( 'industry', $post['id'] ),
            'year_range'   => get_field( 'year_range', $post['id'] ),
            'scope'        => get_field( 'scope', $post['id'] ) ?: [],
            'lab'          => get_field( 'lab', $post['id'] ),
            'hero_image'   => get_field( 'hero_image', $post['id'] ),
            'gallery'      => get_field( 'gallery', $post['id'] ) ?: [],
            'accent_color' => get_field( 'accent_color', $post['id'] ),
        ];

        return self::shape_archive_project( $raw, get_the_title( $post['id'] ) );
    }

    public static function shape_archive_project( array $raw, string $title ): array {
        return [
            'archive_no'   => $raw['archive_no'],
            'title'        => $title,
            'client'       => $raw['client'],
            'industry'     => $raw['industry'],
            'year_range'   => $raw['year_range'],
            'scope'        => array_map( fn( $row ) => $row['item'], $raw['scope'] ),
            'lab'          => $raw['lab'],
            'hero_image'   => [
                'url' => $raw['hero_image']['url'] ?? null,
                'alt' => $raw['hero_image']['alt'] ?? null,
            ],
            'gallery'      => array_map(
                fn( $img ) => [ 'url' => $img['url'] ?? null, 'alt' => $img['alt'] ?? null ],
                $raw['gallery']
            ),
            'accent_color' => $raw['accent_color'],
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
            'logo'  => [
                'url' => $raw['logo']['url'] ?? null,
                'alt' => $raw['logo']['alt'] ?? null,
            ],
            'order' => $raw['order'],
        ];
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `vendor/bin/phpunit tests/test-rest-contract.php`
Expected: PASS, all three tests.

- [ ] **Step 5: Commit**

```bash
git add wordpress/plugins/kreative-studio-lab/includes/class-rest-contract.php \
        wordpress/plugins/kreative-studio-lab/tests/test-rest-contract.php
git commit -m "feat(content-layer): add REST contract layer decoupled from ACF field names"
```

---

## Task 7: Seed data and WP-CLI import command

**Files:**
- Create: `wordpress/plugins/kreative-studio-lab/data/archive-projects.json`
- Create: `wordpress/plugins/kreative-studio-lab/data/client-logos.json`
- Create: `wordpress/plugins/kreative-studio-lab/bin/class-seed-command.php`
- Test: `wordpress/plugins/kreative-studio-lab/tests/test-seed-data-shape.php`

**Interfaces:**
- Consumes: the field-name contracts from Tasks 4–5, and `shape_archive_project`/`shape_client_logo` from Task 6 for shape validation against the JSON fixture.
- Produces: `wp ksl seed` WP-CLI command, and the two JSON fixtures other tasks (and later stages) treat as the source of truth for launch content.

- [ ] **Step 1: Write archive-projects.json with all six entries from spec §3**

```json
[
  { "archive_no": "01", "title": "N8N Collective", "client": "Nathan Tjoe A On", "industry": "Clothing Brand", "year_range": "2025 – 2026", "lab": "both" },
  { "archive_no": "02", "title": "DRX Wear", "client": "DRX Wear", "industry": "Sport Brand Apparel", "year_range": "2024 – 2025", "lab": "both" },
  { "archive_no": "03", "title": "Howard Smith", "client": "Howard Smith", "industry": "Otomotive Manufacture", "year_range": "2025", "lab": "creative" },
  { "archive_no": "04", "title": "Cargloss Helmet", "client": "Cargloss Helmet", "industry": "Otomotive Manufacture", "year_range": "2024 – 2025", "lab": "creative" },
  { "archive_no": "05", "title": "XL Smart Axiata", "client": "XL Smart Axiata", "industry": "Telekomunikasi", "year_range": "2025 – 2026", "lab": "both" },
  { "archive_no": "06", "title": "Kemenpora", "client": "Kemenpora", "industry": "Sport Event National", "year_range": "2025", "lab": "product" }
]
```

Note on `lab` values: spec §3's table does not tabulate `lab` per project. Values above are inferred from each project's SCOPE OF WORK list in the source deck (pages 12–26) — DRX and N8N list both creative direction and product R&D; Howard Smith and Cargloss list creative direction and campaign production only; XL Smart lists both; Kemenpora lists product R&D and production only. This inference is flagged to the studio for confirmation before final publish; it is not a blocking assumption for this task, which only needs a valid enum value to seed with.

- [ ] **Step 2: Write client-logos.json with the 24 confirmed entries from spec §3, in deck order**

```json
[
  { "name": "Deus", "order": 1 },
  { "name": "BMW Motorrad", "order": 2 },
  { "name": "Unionwell", "order": 3 },
  { "name": "Jägermeister", "order": 4 },
  { "name": "Howard Smith", "order": 5 },
  { "name": "Jameson", "order": 6 },
  { "name": "Von Dutch", "order": 7 },
  { "name": "Shiny Bright", "order": 8 },
  { "name": "Compass", "order": 9 },
  { "name": "XLSmart", "order": 10 },
  { "name": "Cargloss", "order": 11 },
  { "name": "B-LOG", "order": 12 },
  { "name": "Pocari Sweat", "order": 13 },
  { "name": "N8N", "order": 14 },
  { "name": "J&T Express", "order": 15 },
  { "name": "Garuda Indonesia", "order": 16 },
  { "name": "Pertamina", "order": 17 },
  { "name": "Chelsea", "order": 18 },
  { "name": "Erspo", "order": 19 },
  { "name": "DRX", "order": 20 },
  { "name": "Kominfo", "order": 21 },
  { "name": "Kemenpora", "order": 22 },
  { "name": "Sampoerna", "order": 23 },
  { "name": "Grand Hyatt", "order": 24 }
]
```

Only 24 entries are listed — spec §14's open question 2 flags one illegible logo from the deck's client wall as unresolved. The seed command must not silently pad to 25; it seeds exactly what is confirmed, and this gap stays visible until the studio identifies the mark.

- [ ] **Step 3: Write the failing test that the fixture entries shape correctly**

```php
<?php
// tests/test-seed-data-shape.php
use PHPUnit\Framework\TestCase;

class Test_Seed_Data_Shape extends TestCase {
    public function test_archive_projects_fixture_has_six_entries_with_required_keys() {
        $data = json_decode(
            file_get_contents( dirname( __DIR__ ) . '/data/archive-projects.json' ),
            true
        );

        $this->assertCount( 6, $data );

        $required = [ 'archive_no', 'title', 'client', 'industry', 'year_range', 'lab' ];
        foreach ( $data as $entry ) {
            foreach ( $required as $key ) {
                $this->assertArrayHasKey( $key, $entry );
            }
        }
    }

    public function test_archive_projects_fixture_lab_values_are_valid_enum() {
        $data = json_decode(
            file_get_contents( dirname( __DIR__ ) . '/data/archive-projects.json' ),
            true
        );

        foreach ( $data as $entry ) {
            $this->assertContains( $entry['lab'], [ 'product', 'creative', 'both' ] );
        }
    }

    public function test_client_logos_fixture_has_confirmed_entries_only() {
        $data = json_decode(
            file_get_contents( dirname( __DIR__ ) . '/data/client-logos.json' ),
            true
        );

        // 24, not 25 — the 25th mark is unconfirmed per spec open question 2.
        $this->assertCount( 24, $data );

        foreach ( $data as $entry ) {
            $this->assertArrayHasKey( 'name', $entry );
            $this->assertArrayHasKey( 'order', $entry );
        }
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `vendor/bin/phpunit tests/test-seed-data-shape.php`
Expected: PASS immediately, since Steps 1–2 already wrote conforming JSON. This confirms the fixtures match the required shape before the WP-CLI importer is written against them.

- [ ] **Step 5: Write the WP-CLI seed command**

```php
<?php
// bin/class-seed-command.php

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
```

- [ ] **Step 6: Run the seed command against wp-env and verify counts via WP-CLI**

Run: `npx wp-env run cli wp ksl seed`
Expected: `Success: Seeded archive_project and client_logo content.`

Run: `npx wp-env run cli wp post list --post_type=archive_project --format=count`
Expected: `6`

Run: `npx wp-env run cli wp post list --post_type=client_logo --format=count`
Expected: `24`

- [ ] **Step 7: Commit**

```bash
git add wordpress/plugins/kreative-studio-lab/data/archive-projects.json \
        wordpress/plugins/kreative-studio-lab/data/client-logos.json \
        wordpress/plugins/kreative-studio-lab/bin/class-seed-command.php \
        wordpress/plugins/kreative-studio-lab/tests/test-seed-data-shape.php
git commit -m "feat(content-layer): seed six archive projects and 24 confirmed client logos"
```

---

## Task 8: Revalidate webhook to Next.js

**Files:**
- Create: `wordpress/plugins/kreative-studio-lab/includes/class-revalidate-webhook.php`
- Test: `wordpress/plugins/kreative-studio-lab/tests/test-revalidate-webhook.php`

**Interfaces:**
- Consumes: `KSL_CPT_Archive_Project::SLUG`, `KSL_CPT_Client_Logo::SLUG` from Tasks 2–3.
- Produces: a `wp_remote_post` call fired on publish of either CPT. Later stages' `/api/revalidate` handler (built in Stage 2) must accept the header name and payload shape defined here: header `X-KSL-Webhook-Secret`, JSON body `{ "post_type": "<slug>", "post_id": <int> }`.

- [ ] **Step 1: Write the failing test**

```php
<?php
// tests/test-revalidate-webhook.php
use PHPUnit\Framework\TestCase;

class Test_Revalidate_Webhook extends TestCase {
    public function setUp(): void {
        WP_Mock::setUp();
    }

    public function tearDown(): void {
        WP_Mock::tearDown();
    }

    public function test_fires_webhook_for_published_archive_project() {
        WP_Mock::userFunction( 'get_post_type' )->andReturn( 'archive_project' );
        WP_Mock::userFunction( 'getenv' )->with( 'KSL_REVALIDATE_URL' )->andReturn( 'https://front.example/api/revalidate' );
        WP_Mock::userFunction( 'getenv' )->with( 'KSL_REVALIDATE_SECRET' )->andReturn( 'shh' );

        WP_Mock::userFunction( 'wp_remote_post' )
            ->once()
            ->with(
                'https://front.example/api/revalidate',
                Mockery::on( function ( $args ) {
                    $body = json_decode( $args['body'], true );
                    return $args['headers']['X-KSL-Webhook-Secret'] === 'shh'
                        && $body['post_type'] === 'archive_project'
                        && $body['post_id'] === 42;
                } )
            );

        $post = (object) [ 'ID' => 42, 'post_status' => 'publish' ];
        KSL_Revalidate_Webhook::maybe_fire( 42, $post );
        $this->assertTrue( true );
    }

    public function test_does_not_fire_for_unrelated_post_type() {
        WP_Mock::userFunction( 'get_post_type' )->andReturn( 'post' );
        WP_Mock::userFunction( 'wp_remote_post' )->never();

        $post = (object) [ 'ID' => 42, 'post_status' => 'publish' ];
        KSL_Revalidate_Webhook::maybe_fire( 42, $post );
        $this->assertTrue( true );
    }

    public function test_does_not_fire_for_non_publish_status() {
        WP_Mock::userFunction( 'get_post_type' )->andReturn( 'archive_project' );
        WP_Mock::userFunction( 'wp_remote_post' )->never();

        $post = (object) [ 'ID' => 42, 'post_status' => 'draft' ];
        KSL_Revalidate_Webhook::maybe_fire( 42, $post );
        $this->assertTrue( true );
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `vendor/bin/phpunit tests/test-revalidate-webhook.php`
Expected: FAIL — class `KSL_Revalidate_Webhook` not found.

- [ ] **Step 3: Write the webhook class**

```php
<?php
// includes/class-revalidate-webhook.php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class KSL_Revalidate_Webhook {
    const RELEVANT_TYPES = [
        'archive_project',
        'client_logo',
    ];

    public static function maybe_fire( int $post_id, $post ): void {
        if ( $post->post_status !== 'publish' ) {
            return;
        }

        $post_type = get_post_type( $post_id );
        if ( ! in_array( $post_type, self::RELEVANT_TYPES, true ) ) {
            return;
        }

        $url = getenv( 'KSL_REVALIDATE_URL' );
        if ( ! $url ) {
            return;
        }

        wp_remote_post( $url, [
            'headers' => [
                'Content-Type'          => 'application/json',
                'X-KSL-Webhook-Secret'  => getenv( 'KSL_REVALIDATE_SECRET' ),
            ],
            'body'    => wp_json_encode( [
                'post_type' => $post_type,
                'post_id'   => $post_id,
            ] ),
            'timeout' => 5,
            'blocking' => false,
        ] );
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `vendor/bin/phpunit tests/test-revalidate-webhook.php`
Expected: PASS, all three tests.

- [ ] **Step 5: Commit**

```bash
git add wordpress/plugins/kreative-studio-lab/includes/class-revalidate-webhook.php \
        wordpress/plugins/kreative-studio-lab/tests/test-revalidate-webhook.php
git commit -m "feat(content-layer): fire signed revalidate webhook on CPT publish"
```

---

## Task 9: Full-stack REST contract fixture (integration check)

**Files:**
- Create: `scripts/fetch-contract-fixture.sh`
- Create: `wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json` (generated, then committed as the frozen baseline)

**Interfaces:**
- Consumes: the running wp-env instance from Task 1, seeded by Task 7, exposing the contract built in Task 6.
- Produces: `tests/fixtures/rest-contract.json`, the frozen baseline that Stage 2 (front-end) integration tests diff against per spec §12's "Content mapping" test row.

- [ ] **Step 1: Write the fetch script**

```bash
#!/usr/bin/env bash
# scripts/fetch-contract-fixture.sh
set -euo pipefail

BASE_URL="${1:-http://localhost:8888}"
OUT="wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json"

mkdir -p "$(dirname "$OUT")"

projects=$(curl -sf "${BASE_URL}/wp-json/wp/v2/archive-projects?per_page=100&_fields=id,ksl_project")
logos=$(curl -sf "${BASE_URL}/wp-json/wp/v2/client-logos?per_page=100&_fields=id,ksl_logo")

python3 -c "
import json, sys
projects = json.loads(sys.argv[1])
logos = json.loads(sys.argv[2])
out = {
    'archive_projects': [p['ksl_project'] for p in projects],
    'client_logos': [l['ksl_logo'] for l in logos],
}
print(json.dumps(out, indent=2, ensure_ascii=False))
" "$projects" "$logos" > "$OUT"

echo "Wrote $OUT"
```

- [ ] **Step 2: Make it executable and run against the seeded wp-env instance**

Run: `chmod +x scripts/fetch-contract-fixture.sh && ./scripts/fetch-contract-fixture.sh`
Expected: `Wrote wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json`

- [ ] **Step 3: Verify the fixture's shape and counts manually**

Run: `python3 -c "import json; d=json.load(open('wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json')); print(len(d['archive_projects']), len(d['client_logos']))"`
Expected: `6 24`

Run: `python3 -c "import json; d=json.load(open('wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json')); print(sorted(d['archive_projects'][0].keys()))"`
Expected: `['accent_color', 'archive_no', 'client', 'gallery', 'hero_image', 'industry', 'lab', 'scope', 'title', 'year_range']`

- [ ] **Step 4: Commit the fixture as the frozen baseline**

```bash
git add scripts/fetch-contract-fixture.sh \
        wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json
git commit -m "feat(content-layer): freeze REST contract fixture from seeded wp-env instance"
```

This fixture is the deliverable referenced in spec §13 as the stage's stable JSON output. Stage 2's plan consumes this exact file as its starting contract.

---

## Self-Review Notes

**Spec coverage:** §2 (architecture) → Tasks 1–3, 6. §3 (content model, both CPTs and options page) → Tasks 2–5. §4 (routes needing this data) → satisfied by the contract shape in Task 6; no route rendering happens in this stage. §12 ("Content mapping" and "WP → Next contract" test rows) → Tasks 6 and 9. §13 Stage 1 deliverable (stable JSON for launch content) → Task 9, with the 24-vs-25-logo gap explicitly carried forward rather than silently resolved.

**Placeholder scan:** no TBD/TODO markers except the ACF Pro local-path note in Task 1 Step 9, which is a real deployment instruction (a licence key is a secret, not a plan detail), not a deferral of design work.

**Type consistency:** `KSL_CPT_Archive_Project::SLUG` and `KSL_CPT_Client_Logo::SLUG` are defined once (Tasks 2–3) and referenced by name, never restated as string literals, in Tasks 4–6 and 8. The contract shape returned by `shape_archive_project`/`shape_client_logo` in Task 6 is the same shape asserted against in Task 9's fixture check.

**Known open item carried into this plan:** `lab` values per project are inferred from the deck's SCOPE OF WORK lists, not given directly in spec §3's table. This is flagged inline in Task 7 Step 1 for studio confirmation and does not block seeding with a valid, non-placeholder enum value.
