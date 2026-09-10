// NEXUS Neo4j Context Graph Constraints & Schema

// 1. Create Uniqueness Constraints
CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;
CREATE CONSTRAINT context_id_unique IF NOT EXISTS FOR (c:Context) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT source_id_unique IF NOT EXISTS FOR (s:Source) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT person_name_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.name IS UNIQUE;

// 2. Schema Structure Documentation:
// (:User)-[:HAS_CONTEXT]->(:Context)
// (:Context)-[:CONTAINS]->(:Source)
// (:Source)-[:MENTIONS]->(:Person)
// (:Source)-[:RELATES_TO]->(:Project)
// (:Context)-[:HAS_CONFLICT]->(:Context)

// 3. Sample Initialization Data Cypher Queries

MERGE (u:User {id: "usr-primary", email: "user@nexus.ai", name: "Alex Mercer"})

MERGE (cProf:Context {id: "ctx-prof", name: "Professional", color: "#06b6d4"})
MERGE (cFam:Context {id: "ctx-fam", name: "Family", color: "#f43f5e"})
MERGE (cLearn:Context {id: "ctx-learn", name: "Learning", color: "#a855f7"})
MERGE (cSoc:Context {id: "ctx-soc", name: "Social", color: "#10b981"})

MERGE (u)-[:HAS_CONTEXT]->(cProf)
MERGE (u)-[:HAS_CONTEXT]->(cFam)
MERGE (u)-[:HAS_CONTEXT]->(cLearn)
MERGE (u)-[:HAS_CONTEXT]->(cSoc)

// Context Conflict Edge Example
MERGE (cProf)-[r:HAS_CONFLICT {severity: "high", reason: "5:30 PM Q3 Sprint Review overlaps with 6:15 PM Anniversary Dinner"}]->(cFam)
