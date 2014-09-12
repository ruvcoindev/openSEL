var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var Config = require('../entity/config');
var config = new Config();

exports.sendNewPassword = function(user, newPassword) {

	conf = {
		smtp_host: '',
		smtp_port: '',
		email: '',
		email_password: ''
	};
	
	config.selectByKey('EMAIL')
		.then(function(data) {
			conf.email = data.value;
			return config.selectByKey('EMAIL_PASSWORD');
		})
		.then(function(data) {
			conf.email_password = data.value;
			return config.selectByKey('SMTP_HOST');
		})
		.then(function(data) {
			conf.smtp_host = data.value;
			return config.selectByKey('SMTP_PORT');
		})
		.then(function(data) {
			conf.smtp_port = data.value;
			var transporter = nodemailer.createTransport(smtpTransport({
				host: conf.smtp_host,
				port: conf.smtp_port,
				secure: true,
				auth: {
					user: conf.email,
					pass: conf.email_password
				}
			}));
						
			transporter.sendMail({
				from: conf.email,
				to: user.email,
				subject: '[Lambersel] Réinitialisation de votre mot de passe.',
				text: 'Bonjour ' + user.username + '. Votre nouveau mot de passe est ' + newPassword
			});
		})
		.catch(function(err) {
			console.log(err);
		});
}