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