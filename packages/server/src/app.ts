import Koa from 'koa';
import Router from '@koa/router';
import { koaBody } from 'koa-body';

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = new Koa();
const router = new Router();

router
  .post('/projects', async (ctx) => {
  console.log('post projects')
    const name = ctx.request.body.name;

    const p = await prisma.project.create({
      data: {
        name: name,
      }
    })
    ctx.body = 'Project created';

  })
  .get('/projects', async (ctx, next) => {
    console.log('get projects');
    const projects = await prisma.project.findMany({include: {sessions: true}});
    projects.forEach(project => {
      project.totalTime = project.sessions.reduce((acc, session) => {
        if (session.endedAt) {
          return acc +  (session.endedAt.getTime() - session.startedAt.getTime())
        }
        return acc + (new Date().getTime() - session.startedAt.getTime())
      }, 0) / 1000
      project.running = project.sessions.some(session => !session.endedAt) 
    })
    ctx.body = projects;
  })
  .get('/projects/:id', async (ctx) => {
    console.log('get project');
    const project = await prisma.project.findUnique({where: {id: parseInt(ctx.params.id)}, include: {sessions: true}});
    ctx.body = {
      ...project,
      totalTime: project.sessions.reduce((acc, session) => {
        if (session.endedAt) {
          return acc +  (session.endedAt.getTime() - session.startedAt.getTime())
        }
        return acc + (new Date().getTime() - session.startedAt.getTime())
      }, 0) / 1000

    };
  })
  .post('/projects/:id/start', async (ctx) => {
    console.log('Start project')

    const lastSession = await prisma.workSession.findFirst({
      where: {
        projectId: parseInt(ctx.params.id),
      },
      orderBy: {
        startedAt: 'desc'
      }
    })

    if (lastSession && !lastSession.endedAt) {
      ctx.body = 'Session already started';
      return
    }

    const project = await prisma.project.findUnique({where: {id: parseInt(ctx.params.id)}});

      await prisma.workSession.create({
        data: {
          project: {
            connect: {
              id: project.id
            }
          },
          startedAt: new Date(),
          
        }
      })
      
      ctx.body = 'Project created';
  
    })

    .post('/projects/:id/stop', async (ctx) => {
      console.log('Stop project' + ctx.params.id)
  
      const lastSession = await prisma.workSession.findFirst({
        where: {
          projectId: parseInt(ctx.params.id),
        },
        orderBy: {
          endedAt: 'asc'
        }
      })
  
      if (!lastSession || lastSession.endedAt) {
        ctx.body = 'Session already stoped';
        return
      }
  
      lastSession.endedAt = new Date()
      await prisma.workSession.update({
        where: {
          id: lastSession.id
        },
        data: lastSession
      })
        
        ctx.body = 'Session stopped';
    
      })
      .post('/sessions/stop', async (ctx) => {
        console.log('Stop all sessions');
      
        const sessions = await prisma.workSession.updateMany({
          where: { endedAt: null },
          data: { endedAt: new Date() },
        });
      
        ctx.body = `${sessions.count} sessions stopped`;
      })
      .delete('/projects/:id', async (ctx) => {
        console.log('Delete project');
        const { id } = ctx.params;
      
        const project = await prisma.project.delete({
          where: { id: parseInt(id) },
        });
      
        ctx.body = `Project ${project.id} deleted`;
      })

app.use(koaBody());

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
