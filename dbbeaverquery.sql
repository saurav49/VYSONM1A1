select constraint_name
from information_schema.table_constraints
where TABLE_NAME='todos' and
constraint_type='FOREIGN KEY'

alter table todos
drop constraint todos_user_id_fkey;

ALTER TABLE todos
ADD CONSTRAINT todos_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- [Q10] Write a query to get the latest todo item added by each user, along with the user’s name.

select distinct on (t.user_id)
u.name , t.title, t.description , t.due_date , t.is_completed , t.id, t.created_at 
from todos t
inner join users u 
on t.user_id  = u.id
order by t.user_id,  t.created_at desc;

-- [Q11] Write a SQL query to generate a report showing the number of completed and uncompleted todos for each user, along with the user's name and email.

select u."name" , u.email,
COUNT(*) FILTER(where t.is_completed=TRUE) as completed,
COUNT(*) FILTER(where t.is_completed=FALSE) as uncompleted
from todos t 
inner join users u 
on u.id = t.user_id
group by u.name, u.email

drop table todos, users, migrations;

drop type status_types;

-- [Q14] Write a query to fetch all todos where status is not completed and they were created within the last 7 days.

select *
from todos t
where (t.status = 'pending' or t.status = 'in_progress')
and t.created_at BETWEEN NOW() - INTERVAL '7 days' and NOW()

-- [Q16] Write a query to find users who have not completed any of their todos within the last month.

SELECT u.name
FROM users u
WHERE NOT EXISTS (
    SELECT 1
    FROM todos t
    WHERE t.user_id = u.id
      AND t.status = 'completed'
      AND t.created_at >= NOW() - INTERVAL '30 days'
);

-- [Q15] Measure the time taken to fetch todos for a user with 10,000+ todos
explain analyze 
select COUNT(*)
from todos as t
where t.user_id = 11

-- CREATE INDEX
create index idx_todos_user_id on todos(user_id)

-- Check table size
select pg_size_pretty(pg_relation_size('todos'));
select pg_size_pretty(pg_relation_size('idx_todos_user_id'));

-- [Q16] Write a query to find users who have not completed any of their todos within the last month.

select *
from users u
WHERE not exists (
	select 1
	from todos t
	where t.user_id = u.id and
	t.status = 'completed' and
	t.created_at between NOW() - interval '30 days' and NOW()
)
limit 10


-- [Q17 BONUS] Implement a basic priority system for todos, defaulting to 0 (you can define a scale, e.g., 0 for low, 1 for medium, 2 for high). Update Q11 to support grouping by priority.

select u."name", u.email, t.priority,
COUNT(*) FILTER(where t.status = 'completed') as completed,
COUNT(*) FILTER(where t.status = 'pending' or t.status = 'in_progress') as not_completed
from users u 
join todos t ON
u.id = t.user_id
group by u.name, u.email, t.priority

-- [Q18 BONUS] Write a query to track how many todos a user completes per week.

select t.user_id, count(*), date_trunc('week', t.created_at) as completed
from todos t 
where t.status = 'completed'
group by t.created_at, t.user_id
order by t.user_id , t.created_at 

-- [Q19 BONUS] Implement a search feature that allows users to search for todos by title and description. Write a SQL query to perform this search

explain ANALYZE
select *
from todos t 
where t.title ilike '%title_0'
or t.description ilike '%desc_0'

create index idx_todos_title on todos(title);
create index idx_todos_description on todos(description);

select pg_size_pretty(pg_relation_size('todos'));
select pg_size_pretty(pg_relation_size('idx_todos_search'))

CREATE INDEX idx_todos_search
ON todos USING GIN(to_tsvector('english', title || ' ' || description));

explain ANALYZE
select *
from todos t
where to_tsvector(title || '' || description)
@@ to_tsquery('title_0');

explain ANALYZE
SELECT *
FROM todos
WHERE to_tsvector('english', title || ' ' || description)
      @@ to_tsquery('title_0');

drop index idx_todos_title, idx_todos_description;
