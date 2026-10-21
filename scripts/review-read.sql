select jsonb_build_object(
  'projects',
  (
    select coalesce(jsonb_agg(row_to_json(project_row)::jsonb order by project_row.slug), '[]'::jsonb)
    from (
      select
        project.slug,
        project.title,
        project.description,
        project.difficulty,
        project.is_published,
        (
          select coalesce(jsonb_agg(jsonb_build_object(
            'slug', component.slug,
            'name', component.name,
            'description', component.description,
            'category', component.category,
            'quantity', line.quantity,
            'sort_order', line.sort_order,
            'role', requirement.role,
            'policy', requirement.substitution_policy,
            'constraints', (
              select coalesce(jsonb_agg(jsonb_build_object(
                'capability', rule.capability,
                'value', rule.value
              ) order by rule.capability), '[]'::jsonb)
              from public.project_requirement_constraints as rule
              where rule.requirement_id = requirement.id
            )
          ) order by line.sort_order), '[]'::jsonb)
          from public.project_components as line
          join public.components as component on component.id = line.component_id
          left join public.project_requirements as requirement on requirement.project_component_id = line.id
          where line.project_id = project.id
        ) as bom,
        (
          select coalesce(jsonb_agg(jsonb_build_object(
            'sort_order', step.sort_order,
            'stage_sort_order', step.stage_sort_order,
            'stage_title', step.stage_title,
            'title', step.title,
            'description', step.description,
            'tip', step.tip,
            'blocks', step.blocks
          ) order by step.sort_order), '[]'::jsonb)
          from public.project_steps as step
          where step.project_id = project.id
        ) as steps
      from public.projects as project
      where project.slug in ('8', '18', '23', '24')
    ) as project_row
  )
) as review;
