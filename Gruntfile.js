// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

'use strict';

const requirejsConfig = require('./frontend/config');

module.exports = grunt =>
{
  function buildExclusion(exclude)
  {
    return mod =>
    {
      Object.keys(mod.layer.buildPathMap).forEach(moduleName =>
      {
        if (exclude(moduleName))
        {
          mod.exclude.push(moduleName);
        }
      });
    };
  }

  const include = [
    'select2-lang/en',
    'select2-lang/pl',
    'moment-lang/en',
    'moment-lang/pl'
  ];
  const mainModDeps = new Set();
  const modules = [
    {
      name: 'paltrack-main',
      include,
      exclusionBuilder: buildExclusion(moduleName =>
      {
        mainModDeps.add(moduleName);

        if (/^(highcharts|d3)/.test(moduleName))
        {
          return true;
        }

        return false;
      })
    }
  ];

  function appModule(name, options = {})
  {
    return {
      name: `app/${name}/deps`,
      exclusionBuilder: buildExclusion(moduleName => mainModDeps.has(moduleName) || !moduleName.includes(`/${name}`)),
      ...options
    };
  }

  const config = {
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      frontendBuild: [
        './build/frontend',
        './frontend-build'
      ],
      frontendBuilt: [
        './build/frontend',
        './frontend-build/**/*.ejs',
        './frontend-build/**/nls/*.json'
      ],
      scripts: [
        './build/scripts'
      ],
      build: [
        './build'
      ]
    },
    eslint: {
      backend: {
        src: [
          './backend/**/*.js'
        ],
        options: {
          overrideConfigFile: '.eslintrc.json'
        }
      },
      frontend: {
        src: [
          './frontend/app/**/*.js'
        ],
        options: {
          overrideConfigFile: 'frontend/.eslintrc.json'
        }
      }
    },
    copy: {
      frontend: {
        expand: true,
        cwd: './frontend',
        src: '**',
        dest: './build/frontend'
      }
    },
    ejsAmd: {
      frontend: {
        expand: true,
        cwd: './build/frontend',
        src: '**/*.ejs',
        dest: './build/frontend',
        ext: '.js',
        options: {
          helpers: require('./config/paltrack-frontend').express.ejsAmdHelpers
        }
      }
    },
    messageformatAmdLocale: {
      frontend: {
        options: {
          locales: ['en', 'pl'],
          destDir: './build/frontend/app/nls/locale'
        }
      }
    },
    messageformatAmd: {
      frontend: {
        expand: true,
        cwd: './build/frontend',
        src: 'app/**/nls/*.json',
        ext: '.js',
        options: {
          destDir: './build/frontend/app/nls',
          localeModulePrefix: 'app/nls/locale/',
          resolveLocaleAndDomain: function(jsonFile)
          {
            const matches = jsonFile.match(/app\/(.*?)\/nls\/(.*?)\.json/);

            if (matches === null)
            {
              throw new Error(`Invalid MessageFormat JSON file: ${jsonFile}`);
            }

            return {
              locale: matches[2],
              domain: matches[1]
            };
          }
        }
      }
    },
    requirejs: {
      frontend: {
        options: {
          baseUrl: './build/frontend',
          dir: './frontend-build',
          optimize: 'none',
          optimizeCss: 'standard',
          buildCSS: true,
          modules,
          packages: requirejsConfig.packages,
          paths: requirejsConfig.buildPaths,
          shim: requirejsConfig.buildShim,
          locale: 'pl'
        }
      }
    },
    uglify: {
      options: {
        ecma: 5,
        compress: {
          drop_console: false // eslint-disable-line camelcase
        }
      },
      frontend: {
        files: [{
          expand: true,
          cwd: './frontend-build',
          src: '**/*.js',
          dest: './frontend-build'
        }]
      }
    },
    concat: {
      requireMain: {
        files: {}
      }
    }
  };

  modules.forEach(mod =>
  {
    if (mod.name.includes('/'))
    {
      return;
    }

    config.concat.requireMain.files[`frontend-build/${mod.name}.js`] = [
      'frontend-build/config.js',
      'frontend-build/vendor/require/require.js',
      `frontend-build/${mod.name}.js`,
      'frontend-build/main.js'
    ];
  });

  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-uglify-es-multicore');
  grunt.loadNpmTasks('grunt-ejs-amd');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-messageformat-amd');
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.registerTask('default', [
    'clean',
    'eslint:backend',
    'eslint:frontend'
  ]);

  grunt.registerTask('build-frontend', [
    'clean:frontendBuild',
    'copy:frontend',
    'ejsAmd:frontend',
    'messageformatAmdLocale:frontend',
    'messageformatAmd:frontend',
    'requirejs:frontend',
    'uglify:frontend',
    'concat:requireMain',
    'clean:frontendBuilt'
  ]);

  grunt.registerTask('build-all', [
    'clean:build',
    'build-frontend'
  ]);
};
