import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

async function sendEmailToUser(user, template) {
    try {
    const renderedHtml = await ejs.renderFile('path/to/your/template.ejs', { user });

    const msg = {
        to: user.email,
        from: 'no-reply@cbmo.com',
        subject: template.subject,
        text: template.text,
        html: renderedHtml,
    };

    await sgMail.send(msg);
    console.log('Email sent');
    } catch (error) {
    console.error(error);
    }
}


async function notifyUserOfReply(user, reply) {
    try {

    const msg = {
        to: user.email,
        from: 'no-reply@cbmo.com',
        subject: "You have a new reply on your post on cbmo.net!",
        text: reply.content,
        html: reply.content,
    };

    await sgMail.send(msg);
    console.log('Email sent');
    } catch (error) {
    console.error(error);
    }
}

export {notifyUserOfReply, sendEmailToUser}
