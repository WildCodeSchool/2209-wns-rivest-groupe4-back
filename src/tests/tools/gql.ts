import { gql } from "@apollo/client/core";

// User Queries
export const CREATE_USER = gql`
  mutation Mutation($pseudo: String!, $password: String!, $email: String!) {
    createUser(pseudo: $pseudo, password: $password, email: $email) {
      user {
        id
        email
        pseudo
      }
    }
  }
`;

export const GET_TOKEN = gql`
  query Query($password: String!, $email: String!) {
    getTokenWithUser(password: $password, email: $email) {
      token
      user {
        id
        email
        pseudo
      }
    }
  }
`;

export const MODIFY_USER = gql`
  mutation Mutation($email: String, $password: String, $pseudo: String) {
    modifyUser(email: $email, password: $password, pseudo: $pseudo) {
      user {
        pseudo
        email
      }
    }
  }
`;

export const GET_ONE_USER = gql`
  query GetOneUser($getOneUserId: String!) {
    getOneUser(id: $getOneUserId) {
      pseudo
    }
  }
`;

export const GET_ALL_USERS = gql`
  query getAllUsers {
    getAllUsers {
      id
      email
      pseudo
    }
  }
`;

// Project Queries
export const CREATE_PROJECT = gql`
  mutation Mutation(
    $description: String!
    $name: String!
    $isPublic: Boolean!
  ) {
    createProject(description: $description, name: $name, isPublic: $isPublic) {
      id
      isPublic
      name
      description
      folders {
        name
        files {
          content
          extension
          name
        }
      }
      user {
        pseudo
        email
      }
    }
  }
`;

export const MODIFY_PROJECT = gql`
  mutation ModifyProject(
    $modifyProjectId: Float!
    $isPublic: Boolean
    $description: String
    $name: String
  ) {
    modifyProject(
      id: $modifyProjectId
      isPublic: $isPublic
      description: $description
      name: $name
    ) {
      description
      id
      name
      isPublic
      folders {
        name
        files {
          content
          extension
          name
        }
      }
      user {
        email
        pseudo
      }
    }
  }
`;

export const GET_ALL_PROJECTS = gql`
  query Query {
    getAllProjects {
      description
      name
    }
  }
`;

export const GET_ONE_PROJECT = gql`
  query Query($getOneProjectId: Float!) {
    getOneProject(id: $getOneProjectId) {
      name
      description
    }
  }
`;
