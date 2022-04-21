import { gql } from 'apollo-boost';
import client from './client';

const messagesQuery = gql`
  query MessagesQuery {
    messages {
      id
      from
      text
    }
  }
`;

const addMessageMutation = gql`
  mutation AddMessageMutation($input: MessageInput!) {
    message: addMessage(input: $input) {
      id
      from
      text
    }
  }
`;

const messageAddedSubscription = gql`
  subscription {
    messageAdded {
      id
      from
      text
    }
  }
`;

export async function addMessage(text) {
  const { data } = await client.mutate({
    mutation: addMessageMutation,
    variables: { input: { text } },
  });
  return data.message;
}

export async function getMessages() {
  const { data } = await client.query({ query: messagesQuery });
  return data.messages;
}

export async function onMessageAdded(handleMessage) {
  //subscribe to subscription and oberserve any change to be added
  const observable = client.subscribe({ query: messageAddedSubscription });
  // subscribe to this to dispatch message to components
  return observable.subscribe(({ data }) => {
    handleMessage(data.messageAdded);
  });
}