const { createRequest } = require('./request');

const send = (message, options) => {
  const _send = to => createRequest('POST', '/message/send', {
    withToken: true,
    body: {
      ...options,
      ...message,
      ...to,
    },
  });
  return {
    touser(users) {
      if (Array.isArray(users)) users = users.join('|');
      return _send({ touser: users });
    },
    toparty(parties) {
      if (Array.isArray(parties)) parties = parties.join('|');
      return _send({ toparty: parties });
    },
    totag(tags) {
      if (Array.isArray(tags)) tags = tags.join('|');
      return _send({ totag: tags });
    }
  };
};

const sendText = (content, options) => {
  return send({
    msgtype: 'text',
    text: {
      content,
    },
  }, options);
};

const sendImage = (media_id, options) => {
  return send({
    msgtype: 'image',
    image: {
      media_id,
    }
  }, options);
};

const sendVoice = (media_id, options) => {
  return send({
    msgtype: 'voice',
    voice: {
      media_id,
    }
  }, options);
};

module.exports = {
  send,
  sendText,
  sendImage,
  sendVoice,
};