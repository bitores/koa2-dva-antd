import Router from 'koa-router'
import TravelModel from '../../models/post';

const router = new Router();

router.get('/list', async (ctx) => {
  const { page = 1, pageSize = 10, ...params } = ctx.query;
  const pagination = {
    page: parseInt(page, 10) || 1,
    pageSize: parseInt(pageSize, 10) || 10
  }
  const data = await TravelModel.list(params, pagination);
  ctx.body = {
    success: !!data,
    ...data
  }
});

router.post('/create', async (ctx) => {
  const { post_title, post_excerpt, post_type, post_content } = ctx.req.body;
  try {
    await TravelModel.create(post_title, post_excerpt, post_type, post_content);
    ctx.body = {
      success: true
    }
  } catch (error) {
    ctx.body = {
      success: false
    }
  }
});

router.post('/update', async (ctx) => {
  const { post_title, post_excerpt, post_type, post_content } = ctx.req.body;
  let id = parseInt(ctx.req.body.id, 10);
  id = isNaN(id) ? null : id;
  try {
    await TravelModel.update(id, post_title, post_excerpt, post_type, post_content);
    ctx.body = {
      success: true
    }
  } catch (error) {
    ctx.body = {
      success: false
    }
  }
});

router.post('/changeStatus', async (ctx) => {
  const { status } = ctx.req.body;
  let id = parseInt(ctx.req.body.id, 10);
  id = isNaN(id) ? null : id;
  try {
    await TravelModel.changeStatus(id, status);
    ctx.body = {
      success: true
    }
  } catch (error) {
    ctx.body = {
      success: false
    }
  }
});

router.post('/delete', async (ctx) => {
  const id = parseInt(ctx.req.body.id, 10);
  try {
    if (isNaN(id)) {
      throw new Error('id is NaN');
    }
    await TravelModel.delete(id);
    ctx.body = {
      success: true
    }
  } catch (error) {
    ctx.body = {
      success: false,
      message: 'delete error'
    }
  }
});

export default router;
