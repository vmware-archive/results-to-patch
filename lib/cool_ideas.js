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
  //   }))
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