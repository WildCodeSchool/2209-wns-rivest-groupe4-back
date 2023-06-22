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

export const GET_LOGGED_USER = gql`
  query GetLoggedUser {
    getLoggedUser {
      id
      email
      pseudo
      premium
      dailyRuns
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

export const DELETE_USER = gql`
  mutation Mutation {
    deleteUser
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
        id
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

export const DELETE_PROJECT = gql`
  mutation Mutation($deleteProjectId: Float!) {
    deleteProject(id: $deleteProjectId)
  }
`;

// Like Queries
export const ADD_LIKE = gql`
  mutation AddLike($idProject: Float!) {
    addLike(idProject: $idProject) {
      id
      project {
        id
      }
      user {
        id
      }
    }
  }
`;

export const DELETE_LIKE = gql`
  mutation AddLike($idProject: Float!) {
    deleteLike(idProject: $idProject)
  }
`;

export const GET_MONTHLY_LIKES_BY_USER = gql`
  query Query {
    getMonthlyLikesByUser {
      id
    }
  }
`;

export const PROJECT_IS_LIKED = gql`
  query Query($idProject: Float!) {
    projectIsLiked(idProject: $idProject)
  }
`;

// Comment Queries

export const ADD_COMMENT = gql`
  mutation Mutation($idProject: Float!, $comment: String!) {
    addComment(idProject: $idProject, comment: $comment) {
      id
      comment
      createdAt
      updatedAt
      user {
        pseudo
        email
      }
      project {
        id
      }
    }
  }
`;

export const MODIFY_COMMENT = gql`
  mutation Mutation($content: String!, $idComment: Float!) {
    modifyComment(content: $content, idComment: $idComment) {
      id
      comment
      createdAt
      updatedAt
      user {
        pseudo
        email
      }
      project {
        id
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation Mutation($idComment: Float!) {
    deleteComment(idComment: $idComment)
  }
`;

export const GET_ALL_COMMENTS_BY_PROJECT = gql`
  query GetAllCommentsByProjectId($idProject: Float!) {
    getAllCommentsByProjectId(idProject: $idProject) {
      comment
    }
  }
`;

export const GET_MONTHLY_COMMENTS_BY_USER = gql`
  query GetMonthlyCommentsByUser {
    getMonthlyCommentsByUser {
      comment
    }
  }
`;

// Report Queries

export const ADD_REPORT = gql`
  mutation AddReport($idProject: Float!, $content: String!) {
    addReport(idProject: $idProject, content: $content) {
      id
      content
      createdAt
      user {
        pseudo
        email
      }
      project {
        id
      }
    }
  }
`;

export const GET_ALL_REPORTS = gql`
  query Query {
    getAllReports {
      id
    }
  }
`;

// Folder Queries

export const ADD_FOLDER = gql`
  mutation Mutation($parentFolderId: Float!, $name: String!) {
    addFolder(parentFolderId: $parentFolderId, name: $name) {
      id
      name
      parentFolder {
        id
      }
    }
  }
`;

export const RENAME_FOLDER = gql`
  mutation RenameFolder($folderId: Float!, $name: String) {
    renameFolder(folderId: $folderId, name: $name) {
      id
      name
    }
  }
`;

export const GET_ALL_FOLDERS_BY_PROJECT = gql`
  query Query($idProject: Float!) {
    getAllFoldersByProjectId(idProject: $idProject) {
      id
    }
  }
`;

export const DELETE_FOLDER = gql`
  mutation Mutation($folderId: Float!) {
    deleteFolder(folderId: $folderId)
  }
`;

// File Queries

export const ADD_FILE = gql`
  mutation Mutation(
    $folderId: Float!
    $extension: String!
    $content: String!
    $name: String!
  ) {
    addFile(
      folderId: $folderId
      extension: $extension
      content: $content
      name: $name
    ) {
      content
      extension
      id
      name
      folder {
        id
      }
    }
  }
`;

export const MODIFY_FILE = gql`
  mutation Mutation(
    $idFile: Float!
    $extension: String
    $content: String
    $name: String
  ) {
    modifyFile(
      idFile: $idFile
      extension: $extension
      content: $content
      name: $name
    ) {
      content
      extension
      id
      name
      folder {
        id
      }
    }
  }
`;

export const GET_ALL_FILES_BY_FOLDER = gql`
  query GetAllFilesByFolderId($folderId: Float!) {
    getAllFilesByFolderId(folderId: $folderId) {
      id
    }
  }
`;

export const GET_ALL_FILES_BY_PROJECT = gql`
  query GetAllFilesByFolderId($projectId: Float!) {
    getAllFilesByProjectId(projectId: $projectId) {
      id
    }
  }
`;

export const DELETE_FILE = gql`
  mutation Mutation($fileId: Float!) {
    deleteFile(fileId: $fileId)
  }
`;
