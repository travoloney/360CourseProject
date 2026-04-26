# 360CourseProject: Sketchcord

**How to Run**

- Open the project in VSCode
- Navigate to client/public/
- Right-click index.html and click "Open with Live Server" (download the extention if needed)

**Overview and Goals**

Our project involved creating a picture-based messaging web application that allowed multiple users to draw and send messages in real time. This was inspired by Nintendo's PictoChat, where people could paint and type messages to each other.

Main goals: 
  - Working messaging web application (phone app if time)
  - Communication server with multiple clients
  - Picto chat style communication.

**Themes Used**

- File system for handling chat threads
- Scheduling principles for handling messages
- Cache system for loading recent messages or recently used colors
- System-level I/O for sending and receiving messages (web sockets 

**Desicions and Trade-Offs**

Design choices:
- Originally planned to use C, but realized this kind of project needed UI, network, cross-platform support, and real-time events. So ultimately decided to use javascript instead
- How to allow users to draw (Canvas API)
- How to handle messages (represent drawings as strokes)
- How to store messages (database)

Trade-offs:
- All members were more comfortable with C (systems programming language), but this project is more suited for javascript (interactive web app)
- Can't do much system-level stuff since we went with javascript, but this project was more suited for javascript

**Challenges and Lessons Learned**

- Learning js, events architecture, web sockets, SQL + databases
- Understanding code and files created by other members
- Resolving merge conflicts 
