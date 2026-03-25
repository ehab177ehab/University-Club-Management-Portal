# ER Diagram — University Club Management Portal

## Entities & Relationships
```mermaid
erDiagram
  users {
    uuid id PK
    string name
    string email
    string password
    string role
    timestamp created_at
  }
  clubs {
    uuid id PK
    string name
    string description
    string image_url
    uuid created_by FK
    timestamp created_at
  }
  club_admins {
    uuid id PK
    uuid club_id FK
    uuid user_id FK
    timestamp assigned_at
  }
  club_members {
    uuid id PK
    uuid club_id FK
    uuid user_id FK
    timestamp joined_at
  }
  events {
    uuid id PK
    uuid club_id FK
    string title
    string description
    timestamp date
    string location
    int capacity
    boolean members_only
    string status
    uuid created_by FK
    timestamp created_at
  }
  rsvps {
    uuid id PK
    uuid event_id FK
    uuid user_id FK
    timestamp created_at
  }

  users ||--o{ club_admins : "is assigned as"
  clubs ||--o{ club_admins : "has"
  users ||--o{ club_members : "joins"
  clubs ||--o{ club_members : "has"
  clubs ||--o{ events : "hosts"
  users ||--o{ rsvps : "creates"
  events ||--o{ rsvps : "receives"
  users ||--o{ clubs : "creates"
  users ||--o{ events : "creates"
```

## Relationship Rules

- One user can be admin of many clubs (max 3 admins per club)
- One user can be a member of many clubs
- One club can have many events
- One event can have many rsvps (limited by capacity if set)
- A student can only RSVP to a members_only event if they are in club_members for that club
- The super_admin role is seeded directly — cannot be registered through the app
- Student emails must end in @istanbularel.edu.tr