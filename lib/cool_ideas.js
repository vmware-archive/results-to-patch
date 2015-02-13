How to load entire project
1. fetch cached_project and done stories at the same time
2. refetch if either have difference versions
3. poll for commands
4. bring on set up to date if no command changes have affected it

https://beta.pivotaltracker.com/services/v5/projects/808147/stories?date_format=millis&fields=%3Adefault%2Cfollower_ids%2Ctasks%2Ccomments(%3Adefault%2Cfile_attachments%2Cgoogle_attachments)&authenticity_token=BL8CxJXY6WUrF5eIKVI6ojMRvyPcQZbLI8YRJq054c0%3D&accepted_before=1415779200000&envelope=true

https://beta.pivotaltracker.com/services/v5/projects/808147/stories?date_format=millis&fields=:default,follower_ids,tasks,comments(:default,file_attachments,google_attachments),project(:default,shown_iterations_start_time,epics(id,name,label_id),memberships,labels,integrations)&accepted_before=1415779200000&envelope=true

https://beta.pivotaltracker.com/services/v5/projects/808147/stories?date_format=millis&fields=:default,follower_ids,tasks,comments(:default,file_attachments,google_attachments)&accepted_before=1415779200000&envelope=true

https://beta.pivotaltracker.com/services/v5/stories/60544238?
date_format=millis
&fields=:default,follower_ids,tasks,comments(:default,file_attachments,google_attachments)
,project(:default,shown_iterations_start_time,epics(id,name,label_id),memberships,labels,integrations)
&envelope=true

  // {
  //   stories: schema.arrayOf(schema.result('story', {
  //     id:               schema.id('story_id'),

  //     created_at:       schema.attr,
  //     updated_at:       schema.attr,
  //     accepted_at:      schema.attr,
  //     estimate:         schema.attr,
  //     story_type:       schema.attr,
  //     name:             schema.attr,
  //     description:      schema.attr,
  //     current_state:    schema.attr,
  //     requested_by_id:  schema.attr,
  //     owner_ids:        schema.attr,
  //     label_ids:        schema.attr,
  //     tasks:            schema.result({}),
  //     follower_ids:     schema.attr,
  //     comments:         schema.result({}),
  //     owned_by_id:      schema.attr
  //   }))p
  // }

  function cloneSkeleton(json) {
  return {
    stories: _.map(json.stories, function(s) {
      return {
        id: s.id,

        tasks: _.map(s.tasks, function(t) {
          return {id: t.id};
        }),

        comments: _.map(s.comments, function(c) {
          return {
            id: c.id,

            file_attachments: _.map(c.file_attachments, function(fa) {
              return {id: fa.id};
            }),

            google_attachments: _.map(c.google_attachments, function(ga) {
              return {id: ga.id};
            })
          }
        })
      };
    }),

    epics: _.map(json.epics, function(e) {
      return {
        id: e.id,

        comments: _.map(e.comments, function(c) {
          return {
            id: c.id,

            file_attachments: _.map(c.file_attachments, function(fa) {
              return {id: fa.id};
            }),

            google_attachments: _.map(c.google_attachments, function(ga) {
              return {id: ga.id};
            })
          }
        })
      };
    }),

    labels: _.map(json.labels, function(l) {
      return {id: l.id};
    }),

    iteration_overrides: _.map(json.iteration_overrides, function(io) {
      return {number: io.number};
    })
  };