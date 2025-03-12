<template>
    <div class="subscription-listing">
        <h1>Subscription Desactivation</h1>
        <ul>
            <li v-for="subscription in subscriptions" :key="subscription.id">
                {{ subscription.name }} - {{ subscription.price }}
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'ListingSubscription',
    data() {
        return {
            subscriptions: [
                { id: 1, name: 'Basic Plan', price: '$10' },
                { id: 2, name: 'Standard Plan', price: '$20' },
                { id: 3, name: 'Premium Plan', price: '$30' }
            ]
        };
    }
};
</script>

<style scoped>
.subscription-listing {
    padding: 20px;
}

.subscription-listing h1 {
    font-size: 24px;
    margin-bottom: 20px;
}

.subscription-listing ul {
    list-style-type: none;
    padding: 0;
}

.subscription-listing li {
    padding: 10px;
    border-bottom: 1px solid #ccc;
}
</style>
