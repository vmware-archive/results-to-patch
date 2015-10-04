var actions = {
  CREATE_STORY: {},
  UPDATE_STORY: {},
  DELETE_STORY: {},
  REORDER_STORIES: {},
  CREATE_STORY_COMMENT: {},
  UPDATE_STORY_COMMENT: {},
  DELETE_STORY_COMMENT: {},
  CREATE_STORY_COMMENT_FILE_ATTACHMENT: {},
  UPDATE_STORY_COMMENT_FILE_ATTACHMENT: {},
  DELETE_STORY_COMMENT_FILE_ATTACHMENT: {},
  CREATE_STORY_COMMENT_GOOGLE_ATTACHMENT: {},
  UPDATE_STORY_COMMENT_GOOGLE_ATTACHMENT: {},
  DELETE_STORY_COMMENT_GOOGLE_ATTACHMENT: {},
  CREATE_EPIC: {},
  UPDATE_EPIC: {},
  DELETE_EPIC: {},
  REORDER_EPICS: {},
  CREATE_EPIC_COMMENT: {},
  UPDATE_EPIC_COMMENT: {},
  DELETE_EPIC_COMMENT: {},
  CREATE_EPIC_COMMENT_FILE_ATTACHMENT: {},
  UPDATE_EPIC_COMMENT_FILE_ATTACHMENT: {},
  DELETE_EPIC_COMMENT_FILE_ATTACHMENT: {},
  CREATE_EPIC_COMMENT_GOOGLE_ATTACHMENT: {},
  UPDATE_EPIC_COMMENT_GOOGLE_ATTACHMENT: {},
  DELETE_EPIC_COMMENT_GOOGLE_ATTACHMENT: {},
};

function pp(json) {
  console.log(JSON.stringify(json, null, '  '));
}

function groupResults(results) {
  const groups = {
    storyResults: [],
    epicResults: [],
    taskResults: [],
    commentResults: [],
    fileAttachmentResults: [],
    googleAttachmentResults: [],
    iterationResults: [],
  };
  for (let result of results) {
    switch (result.type) {
      case 'story':             groups.storyResults.push(result);            break;
      case 'epic':              groups.epicResults.push(result);             break;
      case 'task':              groups.taskResults.push(result);             break;
      case 'comment':           groups.commentResults.push(result);          break;
      case 'fileAttachment':    groups.fileAttachmentResults.push(result);   break;
      case 'googleAttachment':  groups.googleAttachmentResults.push(result); break;
      case 'iteration':         groups.iterationResults.push(result);        break;
    }
  }
  return groups;
}

function storyIndex(stories, id) {
  for (let i = 0, len = stories.length; i < len; i++) {
    if (stories[i].id === id) return i;
  }
}

function story(state, storyResults) {
  for (let r of storyResults) {
    if (r.type === 'story' && r.id === state.id) {
      if (r.deleted) {
        return null;
      }

      const pick = {};
      if (r.hasOwnProperty('created_at'))       pick.created_at = r.created_at;
      if (r.hasOwnProperty('current_state'))    pick.current_state = r.current_state;
      if (r.hasOwnProperty('description'))      pick.description = r.description;
      if (r.hasOwnProperty('estimate'))         pick.estimate = r.estimate;
      if (r.hasOwnProperty('follower_ids'))     pick.follower_ids = r.follower_ids;
      if (r.hasOwnProperty('label_ids'))        pick.label_ids = r.label_ids;
      if (r.hasOwnProperty('name'))             pick.name = r.name;
      if (r.hasOwnProperty('owner_ids'))        pick.owner_ids = r.owner_ids;
      if (r.hasOwnProperty('requested_by_id'))  pick.requested_by_id = r.requested_by_id;
      if (r.hasOwnProperty('story_type'))       pick.story_type = r.story_type;
      if (r.hasOwnProperty('updated_at'))       pick.updated_at = r.updated_at;
      if (r.hasOwnProperty('accepted_at'))      pick.accepted_at = r.accepted_at;
      if (r.hasOwnProperty('owned_by_id'))      pick.owned_by_id = r.owned_by_id
      if (r.hasOwnProperty('deadline'))         pick.deadline = r.deadline;
      if (r.hasOwnProperty('external_id'))      pick.external_id = r.external_id;
      if (r.hasOwnProperty('integration_id'))   pick.integration_id = r.integration_id;
      return {
        ...state,
        ...pick,
      };
    }
  }
  return state;
}

function stories(state, storyResults) {
  if (storyResults.length) {
    return state.map(function(storyState) {
      return
    });
  }
  return state;

}

export default function project(state, command) {
  const {
    project,
    results,
  } = command;

  const {
    storyResults,
  } = groupResults(results);

  return {
    ...state,
    stories: stories(state.stories, storyResults),
    version: project.version,
  };
}



// function project(state, action) {
//   switch (action.type) {
//     case CREATE_STORY:
//   }

// }

// function fileAttachment(state, fileAttachmentResults) {
// }
// function fileAttachments(state, fileAttachmentResults) {
// }

// function googleAttachment(state, googleAttachmentResults) {
// }
// function googleAttachments(state, googleAttachmentResults) {
// }

// function commentResult(state, commentResults, fileAttachmentResults, googleAttachmentResults) {
// }
// function commentResults(state, commentResults, fileAttachmentResults, googleAttachmentResults) {
// }

// function task(state, taskResults) {
// }
// function tasks(state, taskResults) {
// }

// function story(state, storyResults, taskResults, commentResults, fileAttachmentResults, googleAttachmentResults) {
// }
// function stories(state, storyResults, taskResults, commentResults, fileAttachmentResults, googleAttachmentResults) {
// }

// function epic(state, epicResults, commentResults, fileAttachmentResults, googleAttachmentResults) {
// }
// function epics(state, epicResults, commentResults, fileAttachmentResults, googleAttachmentResults) {
// }

// function project(state = [], result) {
//   const {
//     storyResults,
//     epicResults,
//     taskResults,
//     commentResults,
//     fileAttachmentResults,
//     googleAttachmentResults,
//     iterationResults,
//   } = groupResults(command.results);

//   for (let story of state.stories) {
//     for (let storyResult of storyResults) {
//       if (storyResult.id === story.id) {

//       }
//     }
//   }


//     // for (let comment of story.comments) {
//     //   for (let fileAttachment of comment.file_attachments) {
//     //   }
//     //   for (let googleAttachment of comment.google_attachments) {
//     //   }
//     // }
//   // }

//   for (let epic of state.epics) {

//   }
// }
