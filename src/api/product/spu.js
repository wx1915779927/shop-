/*
    包含spu请求接口
*/
import request from '@/utils/request'
export default {
  // GET / admin / product / baseSaleAttrList
  getSaleAttrList() {
    return request.get('/admin/product/baseSaleAttrList')
  },
  // DELETE / admin / product / deleteSpu / {spuId}
  remove(spuId) {
    return request.delete(`/admin/product/deleteSpu/${spuId}`)
  },
  //   GET / admin / product / getSpuById / {spuId}
  //   获取spu基本信息
  get(spuId) {
    return request.get(`/admin/product/getSpuById/${spuId}`)
  },
  //   POST / admin / product / saveSpuInfo
  // POST / admin / product / updateSpuInfo
  // 更改spu信息
  addUpdate() {
    return request.post(`/admin/product/${spuInfo.id?'update':'save'}SpuInfo`, spuInfo)
  },
  //   GET /admin/product/{page}/{limit}
  getList(page, limit, category3Id) {
    return request.get(`/admin/product/${page}/${limit}`, {
      params: {
        category3Id
      }
    })
  }
}
