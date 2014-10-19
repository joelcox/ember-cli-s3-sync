'use strict';

module.exports = {
  name: 'deploy:s3',
  description: 'Deploys assets from project\'s build output-path (/dist by default) to an S3 bucket.',
  works: 'insideProject',
  aliases: ['s3'],

  availableOptions: [
    { name: 'environment', type: String, required: true},
    { name: 'aws-key', type: String },
    { name: 'aws-secret', type: String },
    { name: 'aws-bucket', type: String },
    { name: 'aws-region', type: String, default: 'us-east-1' }
  ],

  run: function(commandOptions, rawArgs) {
    this.ui.writeLine('commandOptions:')
    console.log(rawArgs);
    console.log('Running');

    var Deployment = this.taskFor();
    var deployment = new Deployment({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });
    return deployment.run(commandOptions);
  },

  taskFor: function() {
    return this.tasks.Deploy;
  }
}
