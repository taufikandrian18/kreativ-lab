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
