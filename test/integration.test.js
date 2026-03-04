const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

describe('Integration Tests', () => {
  describe('Configuration Files', () => {
    it('should have all required files', () => {
      const requiredFiles = [
        'email-channel-plugin.js',
        'package.json',
        'README.md',
        'SKILL.md',
        'LICENSE',
        '.env.example',
        '.github/workflows/test.yml'
      ];
      
      for (const file of requiredFiles) {
        assert.ok(fs.existsSync(file), `Missing required file: ${file}`);
      }
    });
    
    it('should have valid package.json', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      assert.ok(packageJson.name, 'package.json should have name');
      assert.ok(packageJson.version, 'package.json should have version');
      assert.ok(packageJson.description, 'package.json should have description');
      assert.ok(packageJson.main, 'package.json should have main entry point');
      assert.ok(packageJson.scripts, 'package.json should have scripts');
      assert.ok(packageJson.dependencies, 'package.json should have dependencies');
      assert.ok(packageJson.license, 'package.json should have license');
      
      // Check Node.js version requirement
      assert.ok(packageJson.engines, 'package.json should have engines field');
      assert.ok(packageJson.engines.node, 'package.json should specify Node.js version');
      assert.match(packageJson.engines.node, />=22/, 'Should require Node.js 22 or higher');
    });
    
    it('should have valid .env.example file', () => {
      const envExample = fs.readFileSync('.env.example', 'utf8');
      
      assert.ok(envExample.includes('IMAP_HOST'), '.env.example should have IMAP_HOST');
      assert.ok(envExample.includes('IMAP_USER'), '.env.example should have IMAP_USER');
      assert.ok(envExample.includes('IMAP_PASSWORD'), '.env.example should have IMAP_PASSWORD');
      assert.ok(envExample.includes('SMTP_HOST'), '.env.example should have SMTP_HOST');
      assert.ok(envExample.includes('SMTP_USER'), '.env.example should have SMTP_USER');
      assert.ok(envExample.includes('SMTP_PASSWORD'), '.env.example should have SMTP_PASSWORD');
      assert.ok(envExample.includes('EMAIL_ADDRESS'), '.env.example should have EMAIL_ADDRESS');
    });
  });
  
  describe('Plugin File Structure', () => {
    it('should have valid main plugin file', () => {
      const pluginContent = fs.readFileSync('email-channel-plugin.js', 'utf8');
      
      // Check for required classes and methods
      assert.ok(pluginContent.includes('class EmailChannelPlugin'), 'Should define EmailChannelPlugin class');
      assert.ok(pluginContent.includes('constructor(config)'), 'Should have constructor');
      assert.ok(pluginContent.includes('connect()'), 'Should have connect method');
      assert.ok(pluginContent.includes('sendEmail('), 'Should have sendEmail method');
      assert.ok(pluginContent.includes('disconnect()'), 'Should have disconnect method');
      assert.ok(pluginContent.includes('module.exports'), 'Should export the plugin');
      
      // Check for error handling
      assert.ok(pluginContent.includes('try'), 'Should have try-catch blocks');
      assert.ok(pluginContent.includes('catch'), 'Should have try-catch blocks');
      
      // Check for event emission
      assert.ok(pluginContent.includes('emit('), 'Should emit events');
    });
    
    it('should have executable permission on install.sh', () => {
      if (fs.existsSync('install.sh')) {
        const stats = fs.statSync('install.sh');
        assert.ok(stats.mode & 0o111, 'install.sh should be executable');
      }
    });
  });
  
  describe('Documentation', () => {
    it('should have comprehensive README.md', () => {
      const readme = fs.readFileSync('README.md', 'utf8');
      
      assert.ok(readme.includes('# OpenClaw Email Channel Plugin'), 'README should have title');
      assert.ok(readme.includes('## Installation'), 'README should have installation section');
      assert.ok(readme.includes('## Usage'), 'README should have usage section');
      assert.ok(readme.includes('## Configuration'), 'README should have configuration section');
      assert.ok(readme.includes('## License'), 'README should have license section');
    });
    
    it('should have OpenClaw skill documentation', () => {
      const skillDoc = fs.readFileSync('SKILL.md', 'utf8');
      
      assert.ok(skillDoc.includes('# Email Channel Plugin for OpenClaw'), 'SKILL.md should have title');
      assert.ok(skillDoc.includes('## Features'), 'SKILL.md should have features section');
      assert.ok(skillDoc.includes('## Installation'), 'SKILL.md should have installation section');
      assert.ok(skillDoc.includes('## Usage'), 'SKILL.md should have usage section');
    });
  });
});

// Export for test runner
if (require.main === module) {
  require('node:test').run();
}