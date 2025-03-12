import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/auth';
import FormulaView from '@/views/FormulaView.vue';
import ServiceView from '@/views/ServiceView.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),

                },{
                    path: '/services',
                    name: 'Services',
                    component: () => import('@/views/ServiceView.vue'),
                    meta: { requiresAuth: true }
                  },
                  {
                    path: '/formulas',
                    name: 'Formulas',
                    component: () => import('@/views/FormulaView.vue'),
                    meta: { requiresAuth: true }
                },
                  {
                    path: '/add-subscriptions',
                    name: 'Subscription',
                    component: () => import('@/views/subscriptions/AddSubscription.vue'),
                    meta: { requiresAuth: true }
                  },
                  {
                    path: '/listing-subscriptions',
                    name: 'Listing Subscriptions',
                    component: () => import('@/views/subscriptions/ListingSubscription.vue'),
                    meta: { requiresAuth: true }
                  },
                  {
                    path: '/listing-validation-subscriptions',
                    name: 'Validation Subscriptions',
                    component: () => import('@/views/subscriptions/ValidationSubscription.vue'),
                    meta: { requiresAuth: true }
                  },
                  {
                    path: '/listing-activation-subscriptions',
                    name: 'Activation Subscriptions',
                    component: () => import('@/views/subscriptions/ActivationSubscription.vue'),
                    meta: { requiresAuth: true }
                  },
                  {
                    path: '/listing-desactivation-subscriptions',
                    name: 'Desactivation Subscriptions',
                    component: () => import('@/views/subscriptions/DesactivationSubscription.vue'),
                    meta: { requiresAuth: true }
                  },
                  {
                    path: '/listing-termination-subscriptions',
                    name: 'Termination Subscriptions',
                    component: () => import('@/views/subscriptions/TerminationSubscription.vue'),
                    meta: { requiresAuth: true }
                  },
                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue')
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/InputDoc.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/ButtonDoc.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/TableDoc.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/ListDoc.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/TreeDoc.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/PanelsDoc.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/OverlayDoc.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/MediaDoc.vue')
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/MessagesDoc.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/FileDoc.vue')
                },
                {
                    path: '/uikit/menu',
                    name: 'menu',
                    component: () => import('@/views/uikit/MenuDoc.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/ChartDoc.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/MiscDoc.vue')
                },
                {
                    path: '/uikit/timeline',
                    name: 'timeline',
                    component: () => import('@/views/uikit/TimelineDoc.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
                },
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/pages/Documentation.vue')
                }
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },

        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

router.beforeEach((to, from, next) => {

    const authStore = useAuthStore();
    authStore.checkAuth();

    const userRoles = authStore.user ? authStore.user.role : [];
    if (to.meta.requiresAuth && !authStore.getAuth) {
      next('/auth/login');
    } else if (to.meta.roles && !to.meta.roles.some(role => userRoles.includes(role))) {
      next('/auth/access');
    } else {
      next();
    }
  });

export default router;
