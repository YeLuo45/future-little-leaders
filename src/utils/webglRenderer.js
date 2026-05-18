/**
 * V39 WebGL Renderer Utility
 * 轻量级3D渲染工具（不依赖外部库）
 */

// 基础矩阵运算
export const mat4 = {
  create() {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ])
  },

  identity(out) {
    out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0
    out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0
    out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0
    out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1
    return out
  },

  perspective(out, fovy, aspect, near, far) {
    const f = 1.0 / Math.tan(fovy / 2)
    out[0] = f / aspect
    out[1] = 0
    out[2] = 0
    out[3] = 0
    out[4] = 0
    out[5] = f
    out[6] = 0
    out[7] = 0
    out[8] = 0
    out[9] = 0
    out[10] = (far + near) / (near - far)
    out[11] = -1
    out[12] = 0
    out[13] = 0
    out[14] = (2 * far * near) / (near - far)
    out[15] = 0
    return out
  },

  lookAt(out, eye, center, up) {
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len
    const eyex = eye[0], eyey = eye[1], eyez = eye[2]
    const centerx = center[0], centery = center[1], centerz = center[2]
    const upx = up[0], upy = up[1], upz = up[2]

    z0 = eyex - centerx
    z1 = eyey - centery
    z2 = eyez - centerz
    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2)
    z0 *= len; z1 *= len; z2 *= len

    x0 = upy * z2 - upz * z1
    x1 = upz * z0 - upx * z2
    x2 = upx * z1 - upy * z0
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2)
    if (len) { len = 1 / len; x0 *= len; x1 *= len; x2 *= len }

    y0 = z1 * x2 - z2 * x1
    y1 = z2 * x0 - z0 * x2
    y2 = z0 * x1 - z1 * x0
    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2)
    if (len) { len = 1 / len; y0 *= len; y1 *= len; y2 *= len }

    out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0
    out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0
    out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez)
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez)
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez)
    out[15] = 1
    return out
  },

  multiply(out, a, b) {
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]
    const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15]

    let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3]
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7]
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11]
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15]
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

    return out
  },

  translate(out, a, v) {
    const x = v[0], y = v[1], z = v[2]
    out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3]
    out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7]
    out[8] = a[8]; out[9] = a[9]; out[10] = a[10]; out[11] = a[11]
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12]
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13]
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14]
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15]
    return out
  },

  rotateX(out, a, rad) {
    const s = Math.sin(rad), c = Math.cos(rad)
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]
    out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3]
    out[4] = a10 * c + a20 * s
    out[5] = a11 * c + a21 * s
    out[6] = a12 * c + a22 * s
    out[7] = a13 * c + a23 * s
    out[8] = a20 * c - a10 * s
    out[9] = a21 * c - a11 * s
    out[10] = a22 * c - a12 * s
    out[11] = a23 * c - a13 * s
    out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15]
    return out
  },

  rotateY(out, a, rad) {
    const s = Math.sin(rad), c = Math.cos(rad)
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]
    out[0] = a00 * c - a20 * s
    out[1] = a01 * c - a21 * s
    out[2] = a02 * c - a22 * s
    out[3] = a03 * c - a23 * s
    out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7]
    out[8] = a00 * s + a20 * c
    out[9] = a01 * s + a21 * c
    out[10] = a02 * s + a22 * c
    out[11] = a03 * s + a23 * c
    out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15]
    return out
  },

  scale(out, a, v) {
    out[0] = a[0] * v[0]; out[1] = a[1] * v[0]; out[2] = a[2] * v[0]; out[3] = a[3] * v[0]
    out[4] = a[4] * v[1]; out[5] = a[5] * v[1]; out[6] = a[6] * v[1]; out[7] = a[7] * v[1]
    out[8] = a[8] * v[2]; out[9] = a[9] * v[2]; out[10] = a[10] * v[2]; out[11] = a[11] * v[2]
    out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15]
    return out
  }
}

// 3D对象类
export class Object3D {
  constructor() {
    this.position = [0, 0, 0]
    this.rotation = [0, 0, 0]
    this.scale = [1, 1, 1]
    this.visible = true
    this.matrix = mat4.create()
  }

  updateMatrix() {
    mat4.identity(this.matrix)
    mat4.translate(this.matrix, this.matrix, this.position)
    mat4.rotateX(this.matrix, this.matrix, this.rotation[0])
    mat4.rotateY(this.matrix, this.matrix, this.rotation[1])
    mat4.scale(this.matrix, this.matrix, this.scale)
  }
}

// 球体
export class Sphere extends Object3D {
  constructor(radius = 1, widthSeg = 32, heightSeg = 32) {
    super()
    this.radius = radius
    this.widthSeg = widthSeg
    this.heightSeg = heightSeg
    this.vertices = this.generateVertices()
  }

  generateVertices() {
    const vertices = []
    for (let y = 0; y <= this.heightSeg; y++) {
      for (let x = 0; x <= this.widthSeg; x++) {
        const u = x / this.widthSeg
        const v = y / this.heightSeg
        const theta = u * Math.PI * 2
        const phi = v * Math.PI
        vertices.push(
          this.radius * Math.sin(phi) * Math.cos(theta),
          this.radius * Math.cos(phi),
          this.radius * Math.sin(phi) * Math.sin(theta)
        )
      }
    }
    return new Float32Array(vertices)
  }
}

// 立方体
export class Box extends Object3D {
  constructor(width = 1, height = 1, depth = 1) {
    super()
    this.width = width
    this.height = height
    this.depth = depth
    this.vertices = this.generateVertices()
  }

  generateVertices() {
    const w = this.width / 2, h = this.height / 2, d = this.depth / 2
    return new Float32Array([
      // 前面
      -w, -h, d, w, -h, d, w, h, d, -w, h, d,
      // 后面
      w, -h, -d, -w, -h, -d, -w, h, -d, w, h, -d,
      // 顶面
      -w, h, d, w, h, d, w, h, -d, -w, h, -d,
      // 底面
      -w, -h, -d, w, -h, -d, w, -h, d, -w, -h, d,
      // 右面
      w, -h, d, w, -h, -d, w, h, -d, w, h, d,
      // 左面
      -w, -h, -d, -w, -h, d, -w, h, d, -w, h, -d
    ])
  }
}

// 圆环
export class Torus extends Object3D {
  constructor(radius = 1, tube = 0.4, radialSeg = 32, tubularSeg = 32) {
    super()
    this.radius = radius
    this.tube = tube
    this.radialSeg = radialSeg
    this.tubularSeg = tubularSeg
    this.vertices = this.generateVertices()
  }

  generateVertices() {
    const vertices = []
    for (let j = 0; j <= this.radialSeg; j++) {
      for (let i = 0; i <= this.tubularSeg; i++) {
        const u = i / this.tubularSeg * Math.PI * 2
        const v = j / this.radialSeg * Math.PI * 2
        const x = (this.radius + this.tube * Math.cos(v)) * Math.cos(u)
        const y = (this.radius + this.tube * Math.cos(v)) * Math.sin(u)
        const z = this.tube * Math.sin(v)
        vertices.push(x, y, z)
      }
    }
    return new Float32Array(vertices)
  }
}

// 简单场景
export class Scene {
  constructor() {
    this.objects = []
    this.camera = {
      position: [0, 0, 5],
      target: [0, 0, 0],
      up: [0, 1, 0]
    }
    this.lights = []
  }

  add(object) {
    this.objects.push(object)
  }

  remove(object) {
    const index = this.objects.indexOf(object)
    if (index > -1) this.objects.splice(index, 1)
  }

  addLight(color = [1, 1, 1], intensity = 1) {
    this.lights.push({ color, intensity })
  }
}

// 基础着色器
export const basicVertexShader = `
  attribute vec3 aPosition;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  varying vec3 vNormal;
  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
    vNormal = aPosition;
  }
`

export const basicFragmentShader = `
  precision mediump float;
  uniform vec4 uColor;
  void main() {
    gl_FragColor = uColor;
  }
`

export default {
  mat4,
  Object3D,
  Sphere,
  Box,
  Torus,
  Scene,
  basicVertexShader,
  basicFragmentShader
}
