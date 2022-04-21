const db = require('./db');
const { PubSub } = require("graphql-subscriptions");
// publush and subsribe one of the alternatives option ... there is kafka as well
const pubsub = new PubSub();

const MESSAGE_ADDED = "MESSAGE_ADDED";

function requireAuth(userId) {
  if (!userId) {
    throw new Error("Unauthorized");
  }
}

const Query = {
  messages: (_root, _args, { userId }) => {
    requireAuth(userId);
    return db.messages.list();
  },
};

const Mutation = {
  addMessage: (_root, { input }, { userId }) => {
    requireAuth(userId);
    const messageId = db.messages.create({ from: userId, text: input.text });
    const message = db.messages.get(messageId);
    pubsub.publish(MESSAGE_ADDED, { messageAdded: message });
    return message;
  },
};

// Different than query, return an iterator that can return multiple values
const Subscription = {
  messageAdded: {
    subscribe: () => pubsub.asyncIterator(MESSAGE_ADDED),
  },
};

module.exports = { Query, Mutation, Subscription };
